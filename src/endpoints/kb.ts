import type { Endpoint, PayloadRequest, Where } from 'payload'
import { EMAIL, toContactSettings } from '@/utilities/contactFields'
import { emailAlertsReady, sendTemplate } from '@/utilities/emailAlert'
import { moderate, REJECT_MESSAGE, type Verdict } from '@/utilities/moderation'
import { clearCookie, hashToken, newLinkToken, publicReader, readerFromCookie, safeNext, sessionCookie, signReader, type Reader, type ReaderDoc } from '@/utilities/readerSession'
import { createHash } from 'node:crypto'
import { alertRecipient, siteInfo } from './contact'
import { postRules, siteRules, type PostRules, type SiteRules } from '@/utilities/kbRules'

/** Anonymous reporters are told apart by a hash of their address, never the address itself. */
const hashKey = (v: string) => createHash('sha256').update(`${process.env.PAYLOAD_SECRET ?? ''}|${v}`).digest('hex').slice(0, 24)

/**
 * The Field Notes API (/api/kb/…). Reading is open to everyone. Commenting, liking, starring and
 * rating need a signed-in reader (GitHub or an emailed link; see src/utilities/readerSession.ts),
 * so each counts once per person. Feedback on selected text stays open without signing in.
 * Everything written is checked (src/utilities/moderation.ts): abuse is refused, anything
 * doubtful waits for approval. Writes must come from this site (Origin check) on top of the
 * SameSite cookie.
 */

type Body = Record<string, unknown>
type Settings = SiteRules
type Ctx = { req: PayloadRequest; reader: Reader | null; doc: ReaderDoc | null; renew: boolean }

/* ------------------------------------------------------------------ helpers */

const hits = new Map<string, number[]>()
/** At most `max` actions per key in `minutes` (per server instance; a light brake). */
function tooMany(key: string, max: number, minutes = 10): boolean {
  const now = Date.now()
  const times = (hits.get(key) ?? []).filter((t) => now - t < minutes * 60_000)
  times.push(now)
  hits.set(key, times)
  if (hits.size > 10_000) hits.clear()
  return times.length > max
}

const secure = (req: PayloadRequest) => (req.headers.get('x-forwarded-proto') ?? new URL(req.url ?? 'http://x').protocol.replace(':', '')) === 'https'
const ip = (req: PayloadRequest) => req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

/** Writes only from pages on this site. */
function sameOrigin(req: PayloadRequest): boolean {
  const origin = req.headers.get('origin')
  if (!origin) return true // same-origin fetches from older browsers may omit it; SameSite still applies
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host')
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

async function context(req: PayloadRequest): Promise<Ctx> {
  if (!(await settingsOf(req)).signIn) return { req, reader: null, doc: null, renew: false }
  const found = await readerFromCookie(req.payload, req.headers.get('cookie'))
  return { req, reader: found?.reader ?? null, doc: found?.doc ?? null, renew: Boolean(found?.renew) }
}

function reply(ctx: Ctx, body: unknown, status = 200, extraCookie?: string): Response {
  const headers = new Headers({ 'Cache-Control': 'no-store' })
  // Keep active readers signed in: a fresh 30-day token once the current one is a week old.
  if (ctx.renew && ctx.doc) headers.append('Set-Cookie', sessionCookie(signReader(ctx.doc), secure(ctx.req)))
  if (extraCookie) headers.append('Set-Cookie', extraCookie)
  return Response.json(body, { status, headers })
}

const SIGN_IN = { error: 'Please sign in first.', signIn: true }

async function readBody(req: PayloadRequest): Promise<Body> {
  try {
    const body = (await req.json?.()) as Body
    return body && typeof body === 'object' ? body : {}
  } catch {
    return {}
  }
}

const text = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/\r\n/g, '\n').trim().slice(0, max) : '')
const idOf = (v: unknown) => (typeof v === 'number' || (typeof v === 'string' && /^\d+$/.test(v)) ? Number(v) : undefined)
const relId = (v: unknown) => (typeof v === 'object' && v ? (v as { id?: number }).id : (v as number | undefined)) ?? null

async function settingsOf(req: PayloadRequest): Promise<Settings> {
  return siteRules((await req.payload.findGlobal({ slug: 'kb-settings' as never, depth: 0 }).catch(() => ({}))) as Record<string, unknown>)
}

/** Should this text wait for approval whatever it says? */
const holdAll = (s: Settings, anonymous: boolean) => s.moderation === 'all' || (anonymous && s.moderation === 'anonymous')

type PostInfo = { id: number; title: string; slug: string; rules: PostRules }
/** A published post with what readers may do on it, or nothing. */
async function postOf(req: PayloadRequest, id: unknown, s?: Settings): Promise<PostInfo | undefined> {
  const n = idOf(id)
  if (!n) return undefined
  const doc = (await req.payload.findByID({ collection: 'posts', id: n, depth: 0 }).catch(() => null)) as { id: number; title: string; slug: string; _status?: string; interaction?: Record<string, never> } | null
  if (!doc || doc._status !== 'published') return undefined
  return { id: doc.id, title: doc.title, slug: doc.slug, rules: postRules(s ?? (await settingsOf(req)), doc.interaction) }
}

/** Bots fill the hidden field, or answer faster than anyone types. */
const isBot = (body: Body) => (typeof body.website === 'string' && body.website.trim() !== '') || (Number(body.startedAt) > 0 && Date.now() - Number(body.startedAt) < 2000)

/** Emails you about new comments, reviews and feedback, from the sender set on the Contact page. */
async function tellOwner(req: PayloadRequest, s: Settings, m: { subject: string; heading: string; intro: string; rows: { label: string; value: string }[]; adminPath: string; replyTo?: string }): Promise<string> {
  if (!s.notify) return 'Off (Field Notes → Settings)'
  if (!emailAlertsReady()) return 'Not sent: RESEND_API_KEY is not set'
  const contact = toContactSettings((await req.payload.findGlobal({ slug: 'contact-page' as never, depth: 0 })) as unknown as Record<string, unknown>)
  const site = await siteInfo(req.payload)
  const to = alertRecipient(contact, site)
  if (!to) return 'Not sent: no address to send to'
  const result = await sendTemplate(
    contact,
    { subject: m.subject, heading: m.heading, intro: m.intro, showAnswers: true, button: 'Open in the admin', footer: 'Sent by Field Notes on {url}.' },
    { name: '', email: '', site: site.name, url: site.url },
    m.rows,
    { to, replyTo: m.replyTo, buttonHref: `${site.url}/admin/${m.adminPath}` },
  )
  return result.ok ? `Emailed to ${to}` : `Not sent: ${result.reason}`
}

const heldNote = (v: Verdict) => (v.action === 'hold' ? `It's waiting for your approval (${v.reason}).` : 'It is live.')

/** Readers who are blocked: what they wrote is hidden. */
async function blockedReaders(req: PayloadRequest): Promise<number[]> {
  const r = await req.payload.find({ collection: 'readers' as never, where: { status: { equals: 'blocked' } }, depth: 0, limit: 1000, pagination: false, overrideAccess: true })
  return (r.docs as unknown as { id: number }[]).map((d) => d.id)
}

/* ------------------------------------------------------------------ session */

/** GET /api/kb/me: who is signed in. */
const me: Endpoint = {
  path: '/kb/me',
  method: 'get',
  handler: async (req) => {
    const ctx = await context(req)
    return reply(ctx, { reader: ctx.reader })
  },
}

/** POST /api/kb/signout: ends the session on this device. */
const signout: Endpoint = {
  path: '/kb/signout',
  method: 'post',
  handler: async (req) => {
    const ctx: Ctx = { req, reader: null, doc: null, renew: false }
    if (!sameOrigin(req)) return reply(ctx, { error: 'Not allowed.' }, 403)
    return reply(ctx, { ok: true }, 200, clearCookie(secure(req)))
  },
}

/** POST /api/kb/signout-all: ends every session of this reader, on all devices. */
const signoutAll: Endpoint = {
  path: '/kb/signout-all',
  method: 'post',
  handler: async (req) => {
    const ctx = await context(req)
    if (!sameOrigin(req)) return reply(ctx, { error: 'Not allowed.' }, 403)
    if (ctx.doc) await req.payload.update({ collection: 'readers' as never, id: ctx.doc.id, data: { sessionVersion: (ctx.doc.sessionVersion ?? 1) + 1 } as never, overrideAccess: true })
    return reply({ ...ctx, renew: false }, { ok: true }, 200, clearCookie(secure(req)))
  },
}

/** POST /api/kb/email-link {email, name?, next}: emails a one-time sign-in link (15 minutes). */
const emailLink: Endpoint = {
  path: '/kb/email-link',
  method: 'post',
  handler: async (req) => {
    const ctx: Ctx = { req, reader: null, doc: null, renew: false }
    if (!sameOrigin(req)) return reply(ctx, { error: 'Not allowed.' }, 403)
    const body = await readBody(req)
    if (isBot(body)) return reply(ctx, { ok: true })
    const email = text(body.email, 200).toLowerCase()
    const name = text(body.name, 60)
    if (!(await settingsOf(req)).signIn) return reply(ctx, { error: 'Signing in is switched off.' }, 403)
    if (!EMAIL.test(email)) return reply(ctx, { errors: { email: 'Please enter a valid email address.' } }, 400)
    if (name && moderate(name).action !== 'publish') return reply(ctx, { errors: { name: 'Please choose a different name.' } }, 400)
    if (tooMany(`link|${email}`, 3, 15) || tooMany(`link|${ip(req)}`, 8, 15)) return reply(ctx, { error: 'A link was just sent. Please check your inbox (and spam), or try again in a few minutes.' }, 429)
    if (!emailAlertsReady()) return reply(ctx, { error: 'Email sign-in is not available right now. Please use GitHub.' }, 503)
    const token = newLinkToken()
    await req.payload.create({ collection: 'reader-links' as never, data: { tokenHash: hashToken(token), email, name: name || undefined, next: safeNext(body.next), expiresAt: new Date(Date.now() + 15 * 60_000).toISOString() } as never, overrideAccess: true })
    const contact = toContactSettings((await req.payload.findGlobal({ slug: 'contact-page' as never, depth: 0 })) as unknown as Record<string, unknown>)
    const site = await siteInfo(req.payload)
    const origin = new URL(req.url ?? site.url).origin
    const result = await sendTemplate(
      contact,
      { subject: 'Your sign-in link for {site} · Field Notes', heading: 'Sign in to Field Notes', intro: 'Click the button to sign in as {email}. The link works once, for the next 15 minutes.', showAnswers: false, button: 'Sign in', footer: "If you didn't ask for this, you can ignore this email; nobody can sign in without it." },
      { name: name || email, email, site: site.name, url: site.url },
      [],
      { to: email, buttonHref: `${origin}/auth/reader/email?token=${token}` },
    )
    if (!result.ok) return reply(ctx, { error: 'The email could not be sent. Please try again, or use GitHub.' }, 502)
    return reply(ctx, { ok: true })
  },
}

/** POST /api/kb/profile {name}: changes the name shown on your comments and reviews. */
const profile: Endpoint = {
  path: '/kb/profile',
  method: 'post',
  handler: async (req) => {
    const ctx = await context(req)
    if (!sameOrigin(req)) return reply(ctx, { error: 'Not allowed.' }, 403)
    if (!ctx.reader) return reply(ctx, SIGN_IN, 401)
    const name = text((await readBody(req)).name, 60)
    if (name.length < 2) return reply(ctx, { errors: { name: 'Please use at least 2 characters.' } }, 400)
    const s = await settingsOf(req)
    if (moderate(name, { blocked: s.blocked }).action !== 'publish') return reply(ctx, { errors: { name: 'Please choose a different name.' } }, 400)
    const doc = (await req.payload.update({ collection: 'readers' as never, id: ctx.reader.id, data: { name } as never, overrideAccess: true })) as unknown as ReaderDoc
    return reply(ctx, { ok: true, reader: publicReader(doc) })
  },
}

/* ------------------------------------------------------------------ reading */

type CommentDoc = { id: number; name: string; body: string; parent?: unknown; likes?: number; status: string; reader?: unknown; deleted?: boolean; editedAt?: string | null; createdAt: string }
type ReviewDoc = { id: number; name?: string; rating: number; review?: string; status: string; reader?: unknown; editedAt?: string | null; createdAt: string; updatedAt: string }

/** GET /api/kb/thread?post=ID: the comments, likes and reviews of one post, as this reader sees them. */
const thread: Endpoint = {
  path: '/kb/thread',
  method: 'get',
  handler: async (req) => {
    const ctx = await context(req)
    const s = await settingsOf(req)
    const post = await postOf(req, new URL(req.url ?? 'http://x').searchParams.get('post'), s)
    if (!post) return reply(ctx, { error: 'That post was not found.' }, 404)
    const postId = post.id
    const rules = post.rules
    const mine: Where[] = ctx.reader ? [{ and: [{ status: { equals: 'pending' } }, { reader: { equals: ctx.reader.id } }] }] : []
    const visible: Where = { and: [{ post: { equals: postId } }, { or: [{ status: { equals: 'published' } }, ...mine] }] }
    const [comments, reviews, blocked] = await Promise.all([
      rules.comments !== 'off' ? req.payload.find({ collection: 'kb-comments' as never, where: visible, depth: 1, limit: 1000, pagination: false, sort: 'createdAt', overrideAccess: true }) : null,
      rules.ratings ? req.payload.find({ collection: 'kb-reviews' as never, where: visible, depth: 1, limit: 1000, pagination: false, sort: '-createdAt', overrideAccess: true }) : null,
      blockedReaders(req),
    ])
    const ok = (r: unknown) => !blocked.includes(relId(r) ?? -1)
    const cdocs = ((comments?.docs ?? []) as unknown as CommentDoc[]).filter((c) => ok(c.reader))
    const liked = ctx.reader && cdocs.length
      ? ((await req.payload.find({ collection: 'kb-votes' as never, where: { and: [{ kind: { equals: 'like' } }, { reader: { equals: ctx.reader.id } }, { target: { in: cdocs.map((c) => String(c.id)) } }] }, depth: 0, limit: 1000, overrideAccess: true })).docs as unknown as { target: string }[]).map((v) => v.target)
      : []
    const author = (r: unknown, fallback: string) => {
      const d = typeof r === 'object' && r ? (r as ReaderDoc) : null
      if (!d) return { name: fallback, anonymous: true }
      const p = publicReader(d)
      return { name: p.name, avatar: p.avatar, verified: p.verified, github: p.github }
    }
    const rdocs = ((reviews?.docs ?? []) as unknown as ReviewDoc[]).filter((r) => ok(r.reader))
    const shown = rdocs.filter((r) => r.status === 'published')
    const myReview = ctx.reader ? rdocs.find((r) => relId(r.reader) === ctx.reader!.id) : undefined
    return reply(ctx, {
      reader: ctx.reader,
      settings: rules,
      comments: cdocs.map((c) => ({
        id: c.id,
        parent: relId(c.parent),
        author: c.deleted ? { name: 'Deleted' } : author(c.reader, c.name || 'Anonymous'),
        body: c.deleted ? '' : c.body,
        deleted: Boolean(c.deleted),
        likes: c.likes ?? 0,
        liked: liked.includes(String(c.id)),
        pending: c.status === 'pending',
        mine: Boolean(ctx.reader && relId(c.reader) === ctx.reader.id),
        createdAt: c.createdAt,
        editedAt: c.editedAt ?? null,
      })),
      reviews: {
        count: shown.length,
        average: shown.length ? Math.round((shown.reduce((sum, r) => sum + r.rating, 0) / shown.length) * 10) / 10 : 0,
        items: rdocs.filter((r) => r.review?.trim()).map((r) => ({ id: r.id, author: author(r.reader, r.name || 'A reader'), rating: r.rating, review: r.review, pending: r.status === 'pending', mine: Boolean(ctx.reader && relId(r.reader) === ctx.reader.id), createdAt: r.createdAt, editedAt: r.editedAt ?? null })),
        mine: myReview ? { rating: myReview.rating, review: myReview.review ?? '', pending: myReview.status === 'pending' } : null,
      },
    })
  },
}

/** GET /api/kb/stars: how many stars each channel has, and which this reader starred. */
const stars: Endpoint = {
  path: '/kb/stars',
  method: 'get',
  handler: async (req) => {
    const ctx = await context(req)
    const all = (await req.payload.find({ collection: 'kb-votes' as never, where: { kind: { equals: 'star' } }, depth: 0, limit: 10000, pagination: false, overrideAccess: true })).docs as unknown as { target: string; reader: unknown }[]
    const counts: Record<string, number> = {}
    for (const v of all) counts[v.target] = (counts[v.target] ?? 0) + 1
    return reply(ctx, { counts, mine: ctx.reader ? all.filter((v) => relId(v.reader) === ctx.reader!.id).map((v) => v.target) : [] })
  },
}

/* ------------------------------------------------------------------ writing */

/** Shared start of every signed-in write: same site, signed in, not too fast. */
async function guard(req: PayloadRequest, kind: string, max: number): Promise<{ ctx: Ctx; body: Body; error?: Response }> {
  const ctx = await context(req)
  if (!sameOrigin(req)) return { ctx, body: {}, error: reply(ctx, { error: 'Not allowed.' }, 403) }
  if (!ctx.reader) return { ctx, body: {}, error: reply(ctx, SIGN_IN, 401) }
  const body = await readBody(req)
  if (tooMany(`${kind}|${ctx.reader.id}`, max)) return { ctx, body, error: reply(ctx, { error: 'That is a lot in a short time. Please try again in a few minutes.' }, 429) }
  return { ctx, body }
}

/** POST /api/kb/comment {post, parent?, body}: a comment or a reply. */
const comment: Endpoint = {
  path: '/kb/comment',
  method: 'post',
  handler: async (req) => {
    const ctx = await context(req)
    if (!sameOrigin(req)) return reply(ctx, { error: 'Not allowed.' }, 403)
    const body = await readBody(req)
    // Anonymous comments are welcome but braked harder, and any link waits for approval.
    const reader = ctx.reader
    if (!reader && isBot(body)) return reply(ctx, { ok: true, pending: true, comment: null })
    if (reader ? tooMany(`c|${reader.id}`, 8) : tooMany(`ca|${ip(req)}`, 4)) return reply(ctx, { error: 'That is a lot of comments in a short time. Please try again in a few minutes.' }, 429)
    const s = await settingsOf(req)
    const post = await postOf(req, body.post, s)
    if (!post) return reply(ctx, { error: 'That post was not found.' }, 404)
    if (post.rules.comments !== 'on') return reply(ctx, { error: post.rules.comments === 'locked' ? 'Comments on this post are closed.' : 'Comments are switched off.' }, 403)
    if (!reader && !post.rules.anonymous) return reply(ctx, { ...SIGN_IN, error: 'Please sign in to comment.' }, 401)
    const words = text(body.body, 2000)
    if (words.length < 2) return reply(ctx, { errors: { body: 'Write a few words first.' } }, 400)
    let verdict = moderate(words, { blocked: s.blocked, holdAll: holdAll(s, !reader) })
    if (verdict.action === 'reject') return reply(ctx, { errors: { body: REJECT_MESSAGE } }, 400)
    if (!reader && verdict.action === 'publish' && /https?:\/\/|www\./i.test(words)) verdict = { action: 'hold', reason: 'a link from an anonymous reader' }
    let parent = idOf(body.parent)
    if (parent) {
      const p = (await req.payload.findByID({ collection: 'kb-comments' as never, id: parent, depth: 0, overrideAccess: true }).catch(() => null)) as { post?: number } | null
      if (!p || p.post !== post.id) parent = undefined
    }
    const doc = (await req.payload.create({
      collection: 'kb-comments' as never,
      data: { name: reader?.name ?? 'Anonymous', body: words, post: post.id, parent, reader: reader?.id, status: verdict.action === 'hold' ? 'pending' : 'published', reason: verdict.reason } as never,
      overrideAccess: true,
    })) as unknown as { id: number; createdAt: string }
    await tellOwner(req, s, {
      subject: `${parent ? 'New reply' : 'New comment'} on “${post.title}”${verdict.action === 'hold' ? ' (needs approval)' : ''}`,
      heading: `${reader ? reader.name : 'An anonymous reader'} ${parent ? 'replied' : 'commented'} on “${post.title}”`,
      intro: heldNote(verdict),
      rows: [{ label: 'Comment', value: words }, { label: 'Post', value: `/notes/${post.slug}` }],
      adminPath: `collections/kb-comments/${doc.id}`,
      replyTo: ctx.doc?.email || undefined,
    })
    return reply(ctx, {
      ok: true,
      pending: verdict.action === 'hold',
      comment: { id: doc.id, parent: parent ?? null, author: reader ? { name: reader.name, avatar: reader.avatar, verified: reader.verified, github: reader.github } : { name: 'Anonymous', anonymous: true }, body: words, deleted: false, likes: 0, liked: false, pending: verdict.action === 'hold', mine: Boolean(reader), createdAt: doc.createdAt, editedAt: null },
    })
  },
}

/** Your own comment, or an error response. */
async function ownComment(ctx: Ctx, id: unknown): Promise<{ doc?: CommentDoc & { post: unknown }; error?: Response }> {
  const n = idOf(id)
  const doc = n ? ((await ctx.req.payload.findByID({ collection: 'kb-comments' as never, id: n, depth: 0, overrideAccess: true }).catch(() => null)) as (CommentDoc & { post: unknown }) | null) : null
  if (!doc || doc.deleted) return { error: reply(ctx, { error: 'That comment was not found.' }, 404) }
  if (relId(doc.reader) !== ctx.reader!.id) return { error: reply(ctx, { error: 'You can only change your own comments.' }, 403) }
  return { doc }
}

/** POST /api/kb/comment-edit {id, body}: edits your comment; it is checked again and marked edited. */
const commentEdit: Endpoint = {
  path: '/kb/comment-edit',
  method: 'post',
  handler: async (req) => {
    const { ctx, body, error } = await guard(req, 'e', 20)
    if (error) return error
    const { doc, error: notYours } = await ownComment(ctx, body.id)
    if (notYours) return notYours
    const words = text(body.body, 2000)
    if (words.length < 2) return reply(ctx, { errors: { body: 'Write a few words first.' } }, 400)
    if (words === doc!.body) return reply(ctx, { ok: true, unchanged: true })
    const s = await settingsOf(req)
    const verdict = moderate(words, { blocked: s.blocked, holdAll: holdAll(s, false) })
    if (verdict.action === 'reject') return reply(ctx, { errors: { body: REJECT_MESSAGE } }, 400)
    const editedAt = new Date().toISOString()
    // An approved comment edited into something doubtful goes back to waiting.
    const status = verdict.action === 'hold' ? 'pending' : doc!.status === 'hidden' ? 'hidden' : 'published'
    await req.payload.update({ collection: 'kb-comments' as never, id: doc!.id, data: { body: words, editedAt, status, reason: verdict.reason ?? null } as never, overrideAccess: true })
    if (verdict.action === 'hold') {
      const post = await postOf(req, relId(doc!.post))
      await tellOwner(req, s, { subject: `Edited comment needs approval${post ? ` on “${post.title}”` : ''}`, heading: `${ctx.reader!.name} edited a comment`, intro: heldNote(verdict), rows: [{ label: 'Comment', value: words }], adminPath: `collections/kb-comments/${doc!.id}` })
    }
    return reply(ctx, { ok: true, body: words, editedAt, pending: status === 'pending' })
  },
}

/** POST /api/kb/comment-delete {id}: deletes your comment; one with replies stays as "deleted". */
const commentDelete: Endpoint = {
  path: '/kb/comment-delete',
  method: 'post',
  handler: async (req) => {
    const { ctx, body, error } = await guard(req, 'd', 20)
    if (error) return error
    const { doc, error: notYours } = await ownComment(ctx, body.id)
    if (notYours) return notYours
    const replies = (await req.payload.count({ collection: 'kb-comments' as never, where: { parent: { equals: doc!.id } }, overrideAccess: true })).totalDocs
    if (replies) await req.payload.update({ collection: 'kb-comments' as never, id: doc!.id, data: { deleted: true, body: '[deleted]' } as never, overrideAccess: true })
    else {
      await req.payload.delete({ collection: 'kb-votes' as never, where: { and: [{ kind: { equals: 'like' } }, { target: { equals: String(doc!.id) } }] }, overrideAccess: true })
      await req.payload.delete({ collection: 'kb-comments' as never, id: doc!.id, overrideAccess: true })
    }
    return reply(ctx, { ok: true, kept: replies > 0 })
  },
}

/** Adds or removes one like/star for the reader; returns the new state and count. */
async function toggleVote(ctx: Ctx, kind: 'like' | 'star', target: string) {
  const payload = ctx.req.payload
  const where: Where = { and: [{ kind: { equals: kind } }, { target: { equals: target } }, { reader: { equals: ctx.reader!.id } }] }
  const existing = (await payload.find({ collection: 'kb-votes' as never, where, depth: 0, limit: 1, overrideAccess: true })).docs[0]
  if (existing) await payload.delete({ collection: 'kb-votes' as never, where, overrideAccess: true })
  else await payload.create({ collection: 'kb-votes' as never, data: { kind, target, reader: ctx.reader!.id } as never, overrideAccess: true })
  const count = (await payload.count({ collection: 'kb-votes' as never, where: { and: [{ kind: { equals: kind } }, { target: { equals: target } }] }, overrideAccess: true })).totalDocs
  return { on: !existing, count }
}

/** POST /api/kb/like {comment}: likes a comment, or takes the like back. */
const like: Endpoint = {
  path: '/kb/like',
  method: 'post',
  handler: async (req) => {
    const { ctx, body, error } = await guard(req, 'l', 60)
    if (error) return error
    const id = idOf(body.comment)
    const doc = id ? ((await req.payload.findByID({ collection: 'kb-comments' as never, id, depth: 0, overrideAccess: true }).catch(() => null)) as CommentDoc | null) : null
    if (!doc || doc.status !== 'published' || doc.deleted) return reply(ctx, { error: 'That comment was not found.' }, 404)
    const post = await postOf(req, relId((doc as unknown as { post: unknown }).post))
    if (!post?.rules.likes) return reply(ctx, { error: 'Likes are switched off here.' }, 403)
    const { on, count } = await toggleVote(ctx, 'like', String(doc.id))
    await req.payload.update({ collection: 'kb-comments' as never, id: doc.id, data: { likes: count } as never, overrideAccess: true })
    return reply(ctx, { ok: true, liked: on, likes: count })
  },
}

/** POST /api/kb/star {channel}: stars a channel, or takes the star back. */
const star: Endpoint = {
  path: '/kb/star',
  method: 'post',
  handler: async (req) => {
    const { ctx, body, error } = await guard(req, 's', 40)
    if (error) return error
    if (!(await settingsOf(req)).stars) return reply(ctx, { error: 'Starring channels is switched off.' }, 403)
    const id = idOf(body.channel)
    const channel = id ? await req.payload.findByID({ collection: 'categories', id, depth: 0 }).catch(() => null) : null
    if (!channel) return reply(ctx, { error: 'That channel was not found.' }, 404)
    const { on, count } = await toggleVote(ctx, 'star', String(id))
    return reply(ctx, { ok: true, starred: on, count })
  },
}

/** POST /api/kb/review {post, rating 1–5, review?}: one rating per reader per post; again updates it. */
const review: Endpoint = {
  path: '/kb/review',
  method: 'post',
  handler: async (req) => {
    const { ctx, body, error } = await guard(req, 'r', 15)
    if (error) return error
    const reader = ctx.reader!
    const s = await settingsOf(req)
    const post = await postOf(req, body.post, s)
    if (!post) return reply(ctx, { error: 'That post was not found.' }, 404)
    if (!post.rules.ratings) return reply(ctx, { error: 'Ratings are switched off here.' }, 403)
    const rating = Math.round(Number(body.rating))
    if (!(rating >= 1 && rating <= 5)) return reply(ctx, { errors: { rating: 'Pick 1 to 5 stars.' } }, 400)
    const words = text(body.review, 1000)
    const verdict: Verdict = words ? moderate(words, { blocked: s.blocked, holdAll: holdAll(s, false) }) : { action: 'publish' }
    if (verdict.action === 'reject') return reply(ctx, { errors: { review: REJECT_MESSAGE } }, 400)
    const where: Where = { and: [{ post: { equals: post.id } }, { reader: { equals: reader.id } }] }
    const existing = (await req.payload.find({ collection: 'kb-reviews' as never, where, depth: 0, limit: 1, overrideAccess: true })).docs[0] as unknown as ReviewDoc | undefined
    const data = { rating, review: words || null, name: reader.name, post: post.id, reader: reader.id, status: verdict.action === 'hold' ? 'pending' : 'published', reason: verdict.reason ?? null, ...(existing && words !== (existing.review ?? '') ? { editedAt: new Date().toISOString() } : {}) }
    const doc = existing
      ? ((await req.payload.update({ collection: 'kb-reviews' as never, id: existing.id, data: data as never, overrideAccess: true })) as unknown as { id: number })
      : ((await req.payload.create({ collection: 'kb-reviews' as never, data: data as never, overrideAccess: true })) as unknown as { id: number })
    // A new or changed written review is worth an email; a bare star rating is not.
    if (words && words !== (existing?.review ?? '')) {
      await tellOwner(req, s, {
        subject: `${'★'.repeat(rating)}${'☆'.repeat(5 - rating)} review of “${post.title}”${verdict.action === 'hold' ? ' (needs approval)' : ''}`,
        heading: `${reader.name} rated “${post.title}” ${rating}/5`,
        intro: heldNote(verdict),
        rows: [{ label: 'Review', value: words }, { label: 'Post', value: `/notes/${post.slug}` }],
        adminPath: `collections/kb-reviews/${doc.id}`,
        replyTo: ctx.doc?.email || undefined,
      })
    }
    return reply(ctx, { ok: true, pending: verdict.action === 'hold' })
  },
}

/** POST /api/kb/review-delete {post}: removes your rating and review of a post. */
const reviewDelete: Endpoint = {
  path: '/kb/review-delete',
  method: 'post',
  handler: async (req) => {
    const { ctx, body, error } = await guard(req, 'rd', 15)
    if (error) return error
    const postId = idOf(body.post)
    if (!postId) return reply(ctx, { error: 'Which post?' }, 400)
    await req.payload.delete({ collection: 'kb-reviews' as never, where: { and: [{ post: { equals: postId } }, { reader: { equals: ctx.reader!.id } }] }, overrideAccess: true })
    return reply(ctx, { ok: true })
  },
}

/** POST /api/kb/feedback {post, kind, quote?, note?, email?}: feedback on selected text; no sign-in needed. */
const feedback: Endpoint = {
  path: '/kb/feedback',
  method: 'post',
  handler: async (req) => {
    const ctx = await context(req)
    if (!sameOrigin(req)) return reply(ctx, { error: 'Not allowed.' }, 403)
    const body = await readBody(req)
    if (isBot(body)) return reply(ctx, { ok: true })
    const s = await settingsOf(req)
    const post = await postOf(req, body.post, s)
    if (!post) return reply(ctx, { error: 'That post was not found.' }, 404)
    if (!post.rules.feedback) return reply(ctx, { error: 'Feedback is switched off here.' }, 403)
    const kind = ['wrong', 'simpler', 'other'].includes(String(body.kind)) ? String(body.kind) : 'other'
    const quote = text(body.quote, 1000)
    const note = text(body.note, 2000)
    const email = text(body.email, 200) || ctx.doc?.email || ''
    if (!quote && !note) return reply(ctx, { errors: { note: 'Tell me a little about it.' } }, 400)
    if (email && !EMAIL.test(email)) return reply(ctx, { errors: { email: 'That email does not look right. It is optional.' } }, 400)
    if (moderate(note, { blocked: s.blocked }).action === 'reject') return reply(ctx, { errors: { note: REJECT_MESSAGE } }, 400)
    if (tooMany(`f|${ctx.reader?.id ?? ip(req)}`, 10)) return reply(ctx, { error: 'That is a lot of feedback in a short time. Please try again in a few minutes.' }, 429)
    const doc = (await req.payload.create({ collection: 'kb-feedback' as never, data: { kind, quote, note, email: email || undefined, post: post.id, reader: ctx.reader?.id } as never, overrideAccess: true })) as unknown as { id: number }
    const label = { wrong: 'Looks wrong', simpler: 'Could be simpler', other: 'Feedback' }[kind]
    const alert = await tellOwner(req, s, {
      subject: `${label}: “${post.title}”`,
      heading: `${label} on “${post.title}”`,
      intro: ctx.reader ? `${ctx.reader.name} sent feedback on your post.` : 'A reader sent feedback on your post.',
      rows: [...(quote ? [{ label: 'Selected text', value: quote }] : []), ...(note ? [{ label: 'What they said', value: note }] : []), ...(email ? [{ label: 'Email', value: email }] : []), { label: 'Post', value: `/notes/${post.slug}` }],
      adminPath: `collections/kb-feedback/${doc.id}`,
      replyTo: email || undefined,
    })
    await req.payload.update({ collection: 'kb-feedback' as never, id: doc.id, data: { alert } as never, overrideAccess: true }).catch(() => undefined)
    return reply(ctx, { ok: true })
  },
}

/** POST /api/kb/report {comment, reason, note?}: anyone can report a comment; you decide in the admin. */
const report: Endpoint = {
  path: '/kb/report',
  method: 'post',
  handler: async (req) => {
    const ctx = await context(req)
    if (!sameOrigin(req)) return reply(ctx, { error: 'Not allowed.' }, 403)
    const body = await readBody(req)
    if (isBot(body)) return reply(ctx, { ok: true })
    if (!(await settingsOf(req)).reports) return reply(ctx, { error: 'Reporting is switched off.' }, 403)
    const reasons = ['spam', 'abuse', 'hate', 'misleading', 'off-topic', 'other']
    const reason = reasons.includes(String(body.reason)) ? String(body.reason) : ''
    if (!reason) return reply(ctx, { errors: { reason: 'Pick a reason.' } }, 400)
    const note = text(body.note, 1000)
    const id = idOf(body.comment)
    const c = id ? ((await req.payload.findByID({ collection: 'kb-comments' as never, id, depth: 0, overrideAccess: true }).catch(() => null)) as (CommentDoc & { post: unknown }) | null) : null
    if (!c || c.deleted) return reply(ctx, { error: 'That comment was not found.' }, 404)
    const key = ctx.reader ? `r${ctx.reader.id}` : `ip${hashKey(ip(req))}`
    if (tooMany(`rep|${key}`, 10)) return reply(ctx, { error: 'That is a lot of reports in a short time. Please try again later.' }, 429)
    const already = await req.payload.count({ collection: 'kb-reports' as never, where: { and: [{ comment: { equals: c.id } }, { reporterKey: { equals: key } }] }, overrideAccess: true })
    if (already.totalDocs) return reply(ctx, { ok: true, already: true })
    const postId = relId(c.post)
    const doc = (await req.payload.create({ collection: 'kb-reports' as never, data: { reason, note, quote: c.body, comment: c.id, post: postId, reader: ctx.reader?.id, reporterKey: key, status: 'open' } as never, overrideAccess: true })) as unknown as { id: number }
    const s = await settingsOf(req)
    const post = await postOf(req, postId)
    const alert = await tellOwner(req, s, {
      subject: `Comment reported${post ? ` on “${post.title}”` : ''}: ${reason}`,
      heading: 'A comment was reported',
      intro: `${ctx.reader ? ctx.reader.name : 'An anonymous reader'} reported a comment by ${c.name || 'Anonymous'}. Open it to hide or delete the comment, then mark the report.`,
      rows: [{ label: 'Reason', value: reason }, ...(note ? [{ label: 'Note', value: note }] : []), { label: 'The comment', value: c.body }, ...(post ? [{ label: 'Post', value: `/notes/${post.slug}` }] : [])],
      adminPath: `collections/kb-reports/${doc.id}`,
      replyTo: ctx.doc?.email || undefined,
    })
    await req.payload.update({ collection: 'kb-reports' as never, id: doc.id, data: { alert } as never, overrideAccess: true }).catch(() => undefined)
    return reply(ctx, { ok: true })
  },
}

/** GET /api/kb/my: the signed-in reader's page: stars, comments, ratings, likes and reports. */
const my: Endpoint = {
  path: '/kb/my',
  method: 'get',
  handler: async (req) => {
    const ctx = await context(req)
    if (!ctx.reader) return reply(ctx, SIGN_IN, 401)
    const id = ctx.reader.id
    const find = (collection: string, where: Where, depth = 1) => req.payload.find({ collection: collection as never, where, depth, limit: 200, pagination: false, sort: '-createdAt', overrideAccess: true }).then((r) => r.docs as unknown as Record<string, unknown>[])
    const [votes, comments, reviews, reports] = await Promise.all([
      find('kb-votes', { reader: { equals: id } }, 0),
      find('kb-comments', { and: [{ reader: { equals: id } }, { deleted: { not_equals: true } }] }),
      find('kb-reviews', { reader: { equals: id } }),
      find('kb-reports', { reader: { equals: id } }, 2),
    ])
    const starIds = votes.filter((v) => v.kind === 'star').map((v) => Number(v.target))
    const likeIds = votes.filter((v) => v.kind === 'like').map((v) => Number(v.target))
    const [channels, liked] = await Promise.all([
      starIds.length ? find('categories', { id: { in: starIds } }, 0) : [],
      likeIds.length ? find('kb-comments', { and: [{ id: { in: likeIds } }, { status: { equals: 'published' } }] }) : [],
    ])
    const postRef = (p: unknown) => (typeof p === 'object' && p ? { title: String((p as { title?: string }).title ?? ''), slug: String((p as { slug?: string }).slug ?? '') } : null)
    return reply(ctx, {
      reader: ctx.reader,
      starred: channels.map((c) => ({ id: c.id, title: c.title, slug: c.slug, emoji: c.emoji || undefined })),
      comments: comments.map((c) => ({ id: c.id, body: c.body, status: c.status, likes: c.likes ?? 0, createdAt: c.createdAt, editedAt: c.editedAt ?? null, post: postRef(c.post) })),
      reviews: reviews.map((r) => ({ id: r.id, rating: r.rating, review: r.review ?? '', status: r.status, createdAt: r.createdAt, post: postRef(r.post) })),
      liked: liked.map((c) => ({ id: c.id, body: c.body, author: c.name || 'Anonymous', createdAt: c.createdAt, post: postRef(c.post) })),
      reports: reports.map((r) => ({ id: r.id, reason: r.reason, status: r.status, quote: r.quote, createdAt: r.createdAt, updatedAt: r.updatedAt, post: postRef(r.post) })),
    })
  },
}

export const kbEndpoints: Endpoint[] = [report, my, me, signout, signoutAll, emailLink, profile, thread, stars, comment, commentEdit, commentDelete, like, star, review, reviewDelete, feedback]
