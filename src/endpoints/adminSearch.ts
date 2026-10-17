import type { Endpoint, Field, PayloadRequest, SanitizedConfig } from 'payload'

export type AdminHit = { kind: 'page' | 'field' | 'document' | 'action'; label: string; detail: string; href: string }

type Entry = AdminHit & { text: string }

const plain = (v: unknown): string => (typeof v === 'string' ? v : v && typeof v === 'object' ? String((v as Record<string, unknown>).en ?? Object.values(v)[0] ?? '') : '')
const humanize = (name: string) => name.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').replace(/^./, (c) => c.toUpperCase())

/** Every labelled field inside rows, collapsibles, tabs, groups and arrays, with the trail that leads to it. */
function walk(fields: Field[], trail: string[], out: { label: string; trail: string[]; description: string }[]) {
  for (const f of fields as (Field & Record<string, unknown>)[]) {
    const admin = (f.admin ?? {}) as { hidden?: boolean; description?: unknown }
    if (admin.hidden || f.type === 'ui') continue
    const name = typeof f.name === 'string' ? f.name : ''
    const label = plain(f.label) || (name ? humanize(name) : '')
    if (f.type === 'tabs') {
      for (const tab of (f.tabs as { label?: unknown; name?: string; fields: Field[] }[]) ?? []) walk(tab.fields, [...trail, plain(tab.label) || humanize(tab.name ?? '')].filter(Boolean), out)
      continue
    }
    if (Array.isArray(f.fields)) {
      if (f.type === 'collapsible' || f.type === 'row') {
        walk(f.fields as Field[], f.type === 'collapsible' && label ? [...trail, label] : trail, out)
        continue
      }
      if (label) out.push({ label, trail, description: plain(admin.description) })
      walk(f.fields as Field[], label ? [...trail, label] : trail, out)
      continue
    }
    if (label && name && !name.startsWith('_')) out.push({ label, trail, description: plain(admin.description) })
  }
}

let cached: { config: SanitizedConfig; entries: Entry[] } | null = null

/** Pages, fields and "create" actions, read from the CMS config, so anything added later is searchable too. */
function configEntries(config: SanitizedConfig): Entry[] {
  if (cached?.config === config) return cached.entries
  const entries: Entry[] = []
  const add = (e: AdminHit, extra = '') => entries.push({ ...e, text: `${e.label} ${e.detail} ${extra}`.toLowerCase() })
  const admin = config.routes.admin
  for (const g of config.globals) {
    if (g.admin?.hidden === true) continue
    const label = plain(g.label) || humanize(g.slug)
    const group = plain(g.admin?.group)
    const href = `${admin}/globals/${g.slug}`
    add({ kind: 'page', label, detail: group ? `Settings · ${group}` : 'Settings', href }, plain(g.admin?.description))
    const found: { label: string; trail: string[]; description: string }[] = []
    walk(g.fields, [], found)
    for (const f of found) add({ kind: 'field', label: f.label, detail: [label, ...f.trail].join(' › '), href }, f.description)
  }
  for (const c of config.collections) {
    if (c.admin?.hidden === true || c.slug.startsWith('payload-')) continue
    const label = plain(c.labels?.plural) || humanize(c.slug)
    const group = plain(c.admin?.group)
    const href = `${admin}/collections/${c.slug}`
    add({ kind: 'page', label, detail: group ? `List · ${group}` : 'List', href }, plain(c.admin?.description))
    add({ kind: 'action', label: `New ${plain(c.labels?.singular) || humanize(c.slug)}`, detail: label, href: `${href}/create` }, 'create add')
    const found: { label: string; trail: string[]; description: string }[] = []
    walk(c.fields, [], found)
    for (const f of found) add({ kind: 'field', label: f.label, detail: [label, ...f.trail].join(' › '), href }, f.description)
  }
  add({ kind: 'page', label: 'Your account', detail: 'Name, email, password, photo, admin theme', href: `${admin}/account` }, 'profile avatar user dark light')
  add(
    { kind: 'page', label: 'Password & two-step sign-in', detail: 'Change your password (Your account); the GitHub step is set up in Supabase', href: `${admin}/account` },
    '2fa two-factor mfa github security login sign in signin reset forgot otp',
  )
  cached = { config, entries }
  return entries
}

function score(e: Entry, words: string[]): number {
  if (!words.every((w) => e.text.includes(w))) return 0
  const label = e.label.toLowerCase()
  const q = words.join(' ')
  let s = label === q ? 100 : label.startsWith(q) ? 60 : label.includes(q) ? 40 : 10
  s += e.kind === 'page' ? 15 : e.kind === 'action' ? 5 : 0
  return s
}

/** Titles of entries in every collection that names one (admin.useAsTitle), within the user's access. */
async function documentHits(req: PayloadRequest, q: string): Promise<AdminHit[]> {
  const { payload } = req
  const admin = payload.config.routes.admin
  const searches = payload.config.collections
    .filter((c) => c.admin?.hidden !== true && !c.slug.startsWith('payload-'))
    .map((c) => ({ c, title: c.admin?.useAsTitle && c.admin.useAsTitle !== 'id' ? c.admin.useAsTitle : c.upload ? 'filename' : null }))
    .filter((s): s is { c: (typeof s)['c']; title: string } => Boolean(s.title))
    .map(async ({ c, title }) => {
      const res = await payload
        .find({ collection: c.slug, where: { [title]: { like: q } }, limit: 4, depth: 0, draft: Boolean(c.versions?.drafts), select: { [title]: true } as never, overrideAccess: false, user: req.user, req })
        .catch(() => null)
      const kind = plain(c.labels?.singular) || humanize(c.slug)
      return ((res?.docs ?? []) as unknown as { id: string | number }[]).map((d) => ({ kind: 'document' as const, label: String((d as unknown as Record<string, unknown>)[title] ?? d.id), detail: kind, href: `${admin}/collections/${c.slug}/${d.id}` }))
    })
  return (await Promise.all(searches)).flat()
}

/** GET /api/admin-search?q=…: the admin's search bar. Signed-in users only. */
export const adminSearch: Endpoint = {
  path: '/admin-search',
  method: 'get',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    const q = String(req.searchParams.get('q') ?? '').trim().slice(0, 80)
    if (!q) return Response.json({ hits: [] })
    const words = q.toLowerCase().split(/\s+/).filter(Boolean)
    const settings = configEntries(req.payload.config)
      .map((e) => ({ e, s: score(e, words) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 14)
      .map(({ e: { text: _text, ...hit } }) => hit)
    // Settings come straight from the config; content needs the database, so the bar asks for it separately.
    if (req.searchParams.get('scope') === 'settings') return Response.json({ hits: settings }, { headers: { 'Cache-Control': 'no-store' } })
    const docs = await Promise.race([documentHits(req, q), new Promise<AdminHit[]>((r) => setTimeout(() => r([]), 6000))])
    if (req.searchParams.get('scope') === 'content') return Response.json({ hits: docs }, { headers: { 'Cache-Control': 'no-store' } })
    return Response.json({ hits: [...docs, ...settings] }, { headers: { 'Cache-Control': 'no-store' } })
  },
}
