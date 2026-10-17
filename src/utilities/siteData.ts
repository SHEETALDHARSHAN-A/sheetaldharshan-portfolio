import { convertLexicalToMarkdown, convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import type { Block, Field, Payload, PayloadRequest, RichTextField, SanitizedCollectionConfig } from 'payload'

/**
 * site.json: every setting and every piece of content in one editable file.
 *
 * - Rich text is Markdown when it is plain (paragraphs, headings, lists, links, quotes); text with
 *   blocks such as code or embeds keeps its exact editor JSON, so nothing is lost on the way back.
 * - Images are `{ "url", "alt" }`. On import a new URL is downloaded into the media library; an image
 *   already there (same file name) is reused.
 * - Links to other entries use that entry's slug (or its title when it has no slug).
 * - Drafts are kept: an entry with unpublished changes carries both, the draft as the entry and the
 *   live version under "_published".
 * - "media" lists the whole media library, so images nothing links to yet come along too. A full
 *   backup (.zip, made in the admin) adds the image files themselves.
 *
 * The shapes follow the CMS config, so fields added later are exported and imported automatically.
 */

export const SITE_JSON_VERSION = 1

/** Content collections, in an order where entries come before the ones that link to them. */
const COLLECTIONS = ['categories', 'experience', 'education', 'certifications', 'publications', 'projects', 'posts', 'pages'] as const
type ContentSlug = (typeof COLLECTIONS)[number]

export type SiteJson = {
  $about?: string
  version: number
  exportedAt?: string
  source?: string
  globals: Record<string, Record<string, unknown>>
  collections: Partial<Record<ContentSlug, Record<string, unknown>[]>>
  media?: { url: string; filename: string; alt?: string; [key: string]: unknown }[]
}

export type ImportReport = {
  dryRun: boolean
  globals: string[]
  created: string[]
  updated: string[]
  images: string[]
  warnings: string[]
}

type Obj = Record<string, unknown>
const isObj = (v: unknown): v is Obj => Boolean(v) && typeof v === 'object' && !Array.isArray(v)

// Lexical nodes Markdown can carry without losing anything.
const PLAIN_NODES = new Set(['root', 'paragraph', 'text', 'heading', 'link', 'autolink', 'list', 'listitem', 'quote', 'linebreak', 'tab'])
function isPlain(node: unknown): boolean {
  if (!isObj(node)) return true
  if (typeof node.type === 'string' && !PLAIN_NODES.has(node.type)) return false
  if (node.type === 'link' && isObj(node.fields) && node.fields.linkType === 'internal') return false
  return Array.isArray(node.children) ? node.children.every(isPlain) : true
}

function identityField(payload: Payload, slug: string): string {
  const c = payload.collections[slug as ContentSlug]?.config
  if (!c) return 'id'
  const hasSlug = c.flattenedFields.some((f) => 'name' in f && f.name === 'slug')
  return hasSlug ? 'slug' : c.admin?.useAsTitle && c.admin.useAsTitle !== 'id' ? c.admin.useAsTitle : 'title'
}

/* ------------------------------------------------------------------ export */

function absolute(url: string, base: string) {
  return /^https?:\/\//.test(url) ? url : `${base}${url.startsWith('/') ? '' : '/'}${url}`
}

function portable(payload: Payload, fields: Field[], data: unknown, base: string): Obj {
  const out: Obj = {}
  if (!isObj(data)) return out
  for (const field of fields) {
    const f = field as Field & Obj
    if (f.type === 'ui' || f.type === 'join') continue
    if (f.type === 'row' || f.type === 'collapsible') {
      Object.assign(out, portable(payload, f.fields as Field[], data, base))
      continue
    }
    if (f.type === 'tabs') {
      for (const tab of f.tabs as (Obj & { fields: Field[]; name?: string })[]) {
        if (tab.name) out[tab.name] = portable(payload, tab.fields, data[tab.name], base)
        else Object.assign(out, portable(payload, tab.fields, data, base))
      }
      continue
    }
    const name = f.name as string | undefined
    // Row ids are internal; the CMS makes new ones on import.
    if (!name || name === 'id' || !(name in data)) continue
    const value = data[name]
    if (value === undefined) continue
    out[name] = portableValue(payload, f, value, base)
  }
  return out
}

function portableValue(payload: Payload, f: Field & Obj, value: unknown, base: string): unknown {
  if (value === null) return null
  switch (f.type) {
    case 'group':
      return portable(payload, f.fields as Field[], value, base)
    case 'array':
      return Array.isArray(value) ? value.map((row) => portable(payload, f.fields as Field[], row, base)) : value
    case 'blocks':
      return Array.isArray(value)
        ? value.map((row: Obj) => {
            const block = (f.blocks as Block[]).find((b) => b.slug === row.blockType)
            return block ? { blockType: row.blockType, ...(row.blockName ? { blockName: row.blockName } : {}), ...portable(payload, block.fields, row, base) } : row
          })
        : value
    case 'upload': {
      const one = (v: unknown) => (isObj(v) && typeof v.url === 'string' ? { url: absolute(v.url, base), alt: v.alt ?? '' } : v)
      return Array.isArray(value) ? value.map(one) : one(value)
    }
    case 'relationship': {
      const to = f.relationTo
      const one = (v: unknown): unknown => {
        if (isObj(v) && 'relationTo' in v) return { relationTo: v.relationTo, value: one2(v.relationTo as string, v.value) }
        return one2(to as string, v)
      }
      const one2 = (slug: string, v: unknown) => (isObj(v) ? (v[identityField(payload, slug)] ?? v.id) : v)
      return Array.isArray(value) ? value.map(one) : one(value)
    }
    case 'richText': {
      if (!isObj(value) || !isObj(value.root) || !isPlain(value.root)) return value
      try {
        return convertLexicalToMarkdown({ data: value as never, editorConfig: editorConfigFactory.fromField({ field: f as unknown as RichTextField }) })
      } catch {
        return value
      }
    }
    default:
      return value
  }
}

/** Everything on the site as one portable object. */
export async function exportSite(payload: Payload, base: string): Promise<SiteJson> {
  const globals: SiteJson['globals'] = {}
  for (const g of payload.config.globals) {
    const doc = await payload.findGlobal({ slug: g.slug as never, depth: 1, draft: true, overrideAccess: true })
    globals[g.slug] = portable(payload, g.fields, doc, base)
  }
  const collections: SiteJson['collections'] = {}
  for (const slug of COLLECTIONS) {
    const c = payload.collections[slug]?.config
    if (!c) continue
    const res = await payload.find({ collection: slug, depth: 1, draft: true, limit: 1000, pagination: false, overrideAccess: true, sort: 'createdAt' })
    // With drafts, the main table holds what is live and the latest draft lives in versions.
    const live = c.versions?.drafts
      ? new Map((await payload.find({ collection: slug, depth: 1, draft: false, limit: 1000, pagination: false, overrideAccess: true })).docs.map((d) => [d.id, d as unknown as Obj]))
      : new Map<number | string, Obj>()
    collections[slug] = res.docs.map((doc) => {
      const row = portable(payload, c.fields, doc, base)
      const status = (doc as unknown as Obj)._status
      if (!c.versions?.drafts || !status) return row
      const published = live.get(doc.id)
      const keepLive = status === 'draft' && published?._status === 'published'
      return { ...row, _status: status, ...(keepLive ? { _published: portable(payload, c.fields, published, base) } : {}) }
    })
  }
  const media = payload.collections.media?.config
  const library = media
    ? (await payload.find({ collection: 'media', depth: 0, limit: 5000, pagination: false, overrideAccess: true, sort: 'createdAt' })).docs.map((d) => {
        const doc = d as unknown as Obj
        // What it takes to recreate the image; resized copies are made again on upload.
        return {
          url: absolute(String(doc.url ?? ''), base),
          filename: String(doc.filename ?? ''),
          alt: String(doc.alt ?? ''),
          ...(doc.caption ? { caption: portableValue(payload, media.fields.find((f) => 'name' in f && f.name === 'caption') as Field & Obj, doc.caption, base) } : {}),
          ...(doc.focalX != null && (doc.focalX !== 50 || doc.focalY !== 50) ? { focalX: doc.focalX, focalY: doc.focalY } : {}),
        }
      })
    : []
  return {
    $about:
      'Every setting and piece of content of this site. Edit it (or have an AI fill it in from your details; see docs/site-json.md) and import it in the admin under Admin panel → Import & export, or with pnpm content:import. Rich text is Markdown; images are { "url", "alt" }; links to other entries use their slug or title.',
    version: SITE_JSON_VERSION,
    exportedAt: new Date().toISOString(),
    source: base,
    globals,
    collections,
    media: library,
  }
}

/* ------------------------------------------------------------------ import */

type Ctx = { payload: Payload; req?: Partial<PayloadRequest>; dryRun: boolean; report: ImportReport; base: string; images: Map<string, number | string> }

const fileNameOf = (url: string) => decodeURIComponent(url.split('?')[0].split('/').pop() || 'image')

async function resolveImage(ctx: Ctx, v: unknown): Promise<unknown> {
  if (v == null || typeof v === 'number') return v
  const url = typeof v === 'string' ? v : isObj(v) && typeof v.url === 'string' ? v.url : null
  if (isObj(v) && v.id != null && !url) return v.id
  if (!url) return undefined
  const alt = isObj(v) && typeof v.alt === 'string' ? v.alt : ''
  const name = fileNameOf(url)
  if (ctx.images.has(url)) return ctx.images.get(url)
  const existing = await ctx.payload.find({ collection: 'media', where: { filename: { equals: name } }, limit: 1, depth: 0, overrideAccess: true })
  if (existing.docs[0]) {
    ctx.images.set(url, existing.docs[0].id)
    return existing.docs[0].id
  }
  ctx.report.images.push(url)
  if (ctx.dryRun) return undefined
  const res = await fetch(absolute(url, ctx.base)).catch(() => null)
  if (!res?.ok) {
    ctx.report.warnings.push(`Could not download image ${url}`)
    return undefined
  }
  const data = Buffer.from(await res.arrayBuffer())
  const doc = await ctx.payload.create({
    collection: 'media',
    data: { alt: alt || name.replace(/\.[a-z0-9]+$/i, '') } as never,
    file: { data, mimetype: res.headers.get('content-type') || 'application/octet-stream', name, size: data.length },
    overrideAccess: true,
    req: ctx.req,
  })
  ctx.images.set(url, doc.id)
  return doc.id
}

async function resolveRef(ctx: Ctx, slug: string, v: unknown, where: string): Promise<unknown> {
  if (v == null || typeof v === 'number') return v
  if (slug === 'users' || slug === 'media') return undefined
  const key = identityField(ctx.payload, slug)
  const res = await ctx.payload.find({ collection: slug as ContentSlug, where: { [key]: { equals: v } }, limit: 1, depth: 0, draft: true, overrideAccess: true })
  if (res.docs[0]) return res.docs[0].id
  ctx.report.warnings.push(`${where}: no ${slug} with ${key} "${String(v)}" yet`)
  return undefined
}

async function fromPortable(ctx: Ctx, fields: Field[], data: unknown, where: string): Promise<Obj> {
  const out: Obj = {}
  if (!isObj(data)) return out
  for (const field of fields) {
    const f = field as Field & Obj
    if (f.type === 'ui' || f.type === 'join') continue
    if (f.type === 'row' || f.type === 'collapsible') {
      Object.assign(out, await fromPortable(ctx, f.fields as Field[], data, where))
      continue
    }
    if (f.type === 'tabs') {
      for (const tab of f.tabs as (Obj & { fields: Field[]; name?: string })[]) {
        if (tab.name) {
          if (tab.name in data) out[tab.name] = await fromPortable(ctx, tab.fields, data[tab.name], where)
        } else Object.assign(out, await fromPortable(ctx, tab.fields, data, where))
      }
      continue
    }
    const name = f.name as string | undefined
    if (!name || !(name in data)) continue
    const value = await valueFromPortable(ctx, f, data[name], `${where} › ${name}`)
    if (value !== undefined) out[name] = value
  }
  return out
}

async function valueFromPortable(ctx: Ctx, f: Field & Obj, value: unknown, where: string): Promise<unknown> {
  if (value === null) return null
  switch (f.type) {
    case 'group':
      return fromPortable(ctx, f.fields as Field[], value, where)
    case 'array':
      return Array.isArray(value) ? Promise.all(value.map((row) => fromPortable(ctx, f.fields as Field[], row, where))) : undefined
    case 'blocks':
      if (!Array.isArray(value)) return undefined
      return Promise.all(
        value.map(async (row: Obj) => {
          const block = (f.blocks as Block[]).find((b) => b.slug === row.blockType)
          if (!block) {
            ctx.report.warnings.push(`${where}: unknown block "${String(row.blockType)}" skipped`)
            return null
          }
          return { blockType: row.blockType, ...(row.blockName ? { blockName: row.blockName } : {}), ...(await fromPortable(ctx, block.fields, row, where)) }
        }),
      ).then((rows) => rows.filter(Boolean))
    case 'upload':
      if (Array.isArray(value)) return (await Promise.all(value.map((v) => resolveImage(ctx, v)))).filter((v) => v !== undefined)
      return resolveImage(ctx, value)
    case 'relationship': {
      const one = async (v: unknown) => {
        if (isObj(v) && typeof v.relationTo === 'string') {
          const id = await resolveRef(ctx, v.relationTo, v.value, where)
          return id === undefined ? undefined : { relationTo: v.relationTo, value: id }
        }
        return typeof f.relationTo === 'string' ? resolveRef(ctx, f.relationTo, v, where) : undefined
      }
      if (Array.isArray(value)) return (await Promise.all(value.map(one))).filter((v) => v !== undefined)
      return one(value)
    }
    case 'richText':
      if (typeof value === 'string') {
        return convertMarkdownToLexical({ markdown: value, editorConfig: editorConfigFactory.fromField({ field: f as unknown as RichTextField }) })
      }
      return value
    default:
      return value
  }
}

/** Reads a site.json into the CMS: settings are replaced, entries matched by slug (or title) are updated, new ones created. */
export async function importSite(payload: Payload, json: SiteJson, opts: { dryRun?: boolean; req?: Partial<PayloadRequest>; base: string; disableRevalidate?: boolean }): Promise<ImportReport> {
  const report: ImportReport = { dryRun: Boolean(opts.dryRun), globals: [], created: [], updated: [], images: [], warnings: [] }
  if (!isObj(json) || !isObj(json.globals ?? {}) || !isObj(json.collections ?? {})) throw new Error('This is not a site.json file (it needs "globals" and "collections").')
  if (json.version && json.version > SITE_JSON_VERSION) report.warnings.push(`File version ${json.version} is newer than this site understands (${SITE_JSON_VERSION}).`)
  const ctx: Ctx = { payload, req: opts.req, dryRun: Boolean(opts.dryRun), report, base: opts.base, images: new Map() }
  const context = opts.disableRevalidate ? { disableRevalidate: true } : {}

  // Entries first, so settings and other entries can link to them; then a second pass fills links to entries created later.
  const pending: { slug: ContentSlug; c: SanitizedCollectionConfig; row: Obj; label: string }[] = []
  for (const slug of COLLECTIONS) {
    const rows = json.collections?.[slug]
    const c = payload.collections[slug]?.config
    if (!rows || !c) continue
    for (const row of rows) {
      if (!isObj(row)) continue
      const key = identityField(payload, slug)
      const label = `${slug}: ${String(row[key] ?? row.title ?? '(untitled)')}`
      pending.push({ slug, c, row, label })
    }
  }

  // The media library first, so entries can point at those images (already there by file name, or downloaded).
  for (const m of json.media ?? []) {
    if (isObj(m) && typeof m.url === 'string') await resolveImage(ctx, { url: m.url, alt: m.alt })
  }

  const ids = new Map<string, number | string>()
  for (const pass of [1, 2]) {
    for (const { slug, c, row, label } of pending) {
      const warningsBefore = report.warnings.length
      const data = await fromPortable(ctx, c.fields, row, label)
      const unresolved = report.warnings.length > warningsBefore
      if (pass === 2 && !unresolved) continue
      if (pass === 1 && unresolved) report.warnings.splice(warningsBefore) // may resolve once everything exists
      const key = identityField(payload, slug)
      const status = row._status === 'draft' ? 'draft' : 'published'
      const existingId =
        ids.get(label) ??
        (row[key] != null
          ? (await payload.find({ collection: slug, where: { [key]: { equals: row[key] } }, limit: 1, depth: 0, draft: true, overrideAccess: true })).docs[0]?.id
          : undefined)
      if (pass === 1) (existingId ? report.updated : report.created).push(label)
      if (ctx.dryRun) continue
      // An entry with unpublished changes: publish the live version first, then save the draft on top.
      const live = c.versions?.drafts && status === 'draft' && isObj(row._published) ? await fromPortable(ctx, c.fields, row._published, label) : null
      let id = existingId
      for (const [values, state] of (live ? [[live, 'published'], [data, 'draft']] : [[data, status]]) as [Obj, string][]) {
        const payloadData = { ...values, ...(c.versions?.drafts ? { _status: state } : {}) } as never
        if (id) await payload.update({ collection: slug, id, data: payloadData, draft: state === 'draft', overrideAccess: true, context, req: opts.req })
        else {
          const doc = await payload.create({ collection: slug, data: payloadData, draft: state === 'draft', overrideAccess: true, context, req: opts.req })
          id = doc.id
          ids.set(label, doc.id)
        }
      }
    }
    if (ctx.dryRun) break
  }

  for (const g of payload.config.globals) {
    const row = json.globals?.[g.slug]
    if (!isObj(row)) continue
    const data = await fromPortable(ctx, g.fields, row, `settings: ${g.slug}`)
    report.globals.push(g.slug)
    if (ctx.dryRun) continue
    const drafts = Boolean(g.versions && typeof g.versions === 'object' && g.versions.drafts)
    await payload.updateGlobal({ slug: g.slug as never, data: { ...data, ...(drafts ? { _status: 'published' } : {}) } as never, overrideAccess: true, context, req: opts.req })
  }
  return report
}
