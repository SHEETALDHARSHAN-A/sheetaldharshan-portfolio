import type { Endpoint, PayloadRequest, Where } from 'payload'
import { toContactSettings } from '@/utilities/contactFields'
import { emailAlertsReady, sendTemplate } from '@/utilities/emailAlert'
import { EMAIL } from '@/utilities/contactFields'
import { moderate, REJECT_MESSAGE, worst, type Verdict } from '@/utilities/moderation'
import { alertRecipient, siteInfo } from './contact'

/**
 * The Field Notes's visitor API (/api/kb/…): threaded comments with likes, star ratings with
 * reviews, channel stars and feedback on selected text. No sign-in: each browser gets a random id in
 * an httpOnly cookie, so a like, star or rating counts once per browser. Everything written is
 * checked (src/utilities/moderation.ts): abuse is refused, anything doubtful waits for approval.
 */

const COOKIE = 'kbv'
type Body = Record<string, unknown>
type Settings = { comments: boolean; reviews: boolean; feedback: boolean; notify: boolean; holdAll: boolean; blocked: string[] }

/* ------------------------------------------------------------------ helpers */

const hits = new Map<string, number[]>()
/** At most `max` actions per visitor and kind in `minutes` (per server instance; a light brake). */
function tooMany(key: string, max: number, minutes = 10): boolean {
  const now = Date.now()
  const times = (hits.get(key) ?? []).filter((t) => now - t < minutes * 60_000)
  times.push(now)
  hits.set(key, times)
  if (hits.size > 10_000) hits.clear()
  return times.length > max
}

function visitorOf(req: PayloadRequest): { id: string; fresh: boolean } {
  const found = (req.headers.get('cookie') ?? '').match(new RegExp(`(?:^|;\\s*)${COOKIE}=([a-f0-9-]{36})`))?.[1]
  return found ? { id: found, fresh: false } : { id: crypto.randomUUID(), fresh: true }
}

function reply(req: PayloadRequest, visitor: { id: string; fresh: boolean }, body: unknown, status = 200): Response {
  const headers = new Headers({ 'Cache-Control': 'no-store' })
  if (visitor.fresh) {
    const secure = new URL(req.url ?? 'http://localhost').protocol === 'https:' ? '; Secure' : ''
    headers.append('Set-Cookie', `${COOKIE}=${visitor.id}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax${secure}`)
  }
  return Response.json(body, { status, headers })
}

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

async function settingsOf(req: PayloadRequest): Promise<Settings> {
  const g = (await req.payload.findGlobal({ slug: 'kb-settings' as never, depth: 0 }).catch(() => ({}))) as Record<string, unknown>
  return {
    comments: g.comments !== false,
    reviews: g.reviews !== false,
    feedback: g.feedback !== false,
    notify: g.notify !== false,
    holdAll: g.moderation === 'all',
    blocked: String(g.blockedWords ?? '').split(/[\n,]+/).map((w) => w.trim()).filter(Boolean),
  }
}

/** A published post, or nothing. */
async function postOf(req: PayloadRequest, id: unknown): Promise<{ id: number; title: string; slug: string } | undefined> {
  const n = idOf(id)
  if (!n) return undefined
  const doc = (await req.payload.findByID({ collection: 'posts', id: n, depth: 0 }).catch(() => null)) as { id: number; title: string; slug: string; _status?: string } | null
  return doc && doc._status === 'published' ? { id: doc.id, title: doc.title, slug: doc.slug } : undefined
}

/** Bots fill the hidden field, or answer faster than anyone types. */
const isBot = (body: Body) => (typeof body.website === 'string' && body.website.trim() !== '') || (Number(body.startedAt) > 0 && Date.now() - Number(body.startedAt) < 2500)

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
    { subject: m.subject, heading: m.heading, intro: m.intro, showAnswers: true, button: 'Open in the admin', footer: 'Sent by the Field Notes on {url}.' },
    { name: '', email: '', site: site.name, url: site.url },
    m.rows,
    { to, replyTo: m.replyTo, buttonHref: `${site.url}/admin/${m.adminPath}` },
  )
  return result.ok ? `Emailed to ${to}` : `Not sent: ${result.reason}`
}

const heldNote = (v: Verdict) => (v.action === 'hold' ? `It's waiting for your approval (${v.reason}).` : 'It is live.')

/* ------------------------------------------------------------------ reading */

type CommentDoc = { id: number; name: string; body: string; parent?: number | { id: number } | null; likes?: number; status: string; visitor?: string; createdAt: string }
type ReviewDoc = { id: number; name?: string; rating: number; review?: string; status: string; visitor?: string; createdAt: string }

/** GET /api/kb/thread?post=ID: the comments, likes and reviews of one post, as this visitor sees them. */
const thread: Endpoint = {
  path: '/kb/thread',
  method: 'get',
  handler: async (req) => {
    const visitor = visitorOf(req)
    const s = await settingsOf(req)
    const postId = idOf(new URL(req.url ?? 'http://x').searchParams.get('post'))
    if (!postId) return reply(req, visitor, { error: 'Which post?' }, 400)
    const visible = (extra: Where): Where => ({ and: [{ post: { equals: postId } }, { or: [{ status: { equals: 'published' } }, { and: [{ status: { equals: 'pending' } }, { visitor: { equals: visitor.id } }] }] }, extra] })
    const [comments, reviews] = await Promise.all([
      s.comments ? req.payload.find({ collection: 'kb-comments' as never, where: visible({}), depth: 0, limit: 1000, sort: 'createdAt', overrideAccess: true }) : null,
      s.reviews ? req.payload.find({ collection: 'kb-reviews' as never, where: visible({}), depth: 0, limit: 1000, sort: '-createdAt', overrideAccess: true }) : null,
    ])
    const cdocs = (comments?.docs ?? []) as unknown as CommentDoc[]
    const liked = cdocs.length
      ? ((await req.payload.find({ collection: 'kb-votes' as never, where: { and: [{ kind: { equals: 'like' } }, { visitor: { equals: visitor.id } }, { target: { in: cdocs.map((c) => String(c.id)) } }] }, depth: 0, limit: 1000, overrideAccess: true })).docs as unknown as { target: string }[]).map((v) => v.target)
      : []
    const rdocs = (reviews?.docs ?? []) as unknown as ReviewDoc[]
    const shown = rdocs.filter((r) => r.status === 'published')
    const mine = rdocs.find((r) => r.visitor === visitor.id)
    return reply(req, visitor, {
      settings: { comments: s.comments, reviews: s.reviews, feedback: s.feedback },
      comments: cdocs.map((c) => ({
        id: c.id,
        parent: typeof c.parent === 'object' ? c.parent?.id ?? null : c.parent ?? null,
        name: c.name,
        body: c.body,
        likes: c.likes ?? 0,
        liked: liked.includes(String(c.id)),
        pending: c.status === 'pending',
        mine: c.visitor === visitor.id,
        createdAt: c.createdAt,
      })),
      reviews: {
        count: shown.length,
        average: shown.length ? Math.round((shown.reduce((sum, r) => sum + r.rating, 0) / shown.length) * 10) / 10 : 0,
        items: rdocs.filter((r) => r.review?.trim()).map((r) => ({ id: r.id, name: r.name || 'A reader', rating: r.rating, review: r.review, pending: r.status === 'pending', mine: r.visitor === visitor.id, createdAt: r.createdAt })),
        mine: mine ? { rating: mine.rating, review: mine.review ?? '', name: mine.name ?? '', pending: mine.status === 'pending' } : null,
      },
    })
  },
}

/** GET /api/kb/stars: how many stars each channel has, and which this visitor starred. */
const stars: Endpoint = {
  path: '/kb/stars',
  method: 'get',
  handler: async (req) => {
    const visitor = visitorOf(req)
    const all = (await req.payload.find({ collection: 'kb-votes' as never, where: { kind: { equals: 'star' } }, depth: 0, limit: 10000, pagination: false, overrideAccess: true })).docs as unknown as { target: string; visitor: string }[]
    const counts: Record<string, number> = {}
    for (const v of all) counts[v.target] = (counts[v.target] ?? 0) + 1
    return reply(req, visitor, { counts, mine: all.filter((v) => v.visitor === visitor.id).map((v) => v.target) })
  },
}

/* ------------------------------------------------------------------ writing */

/** POST /api/kb/comment {post, parent?, name, email?, body}: a comment or a reply. */
const comment: Endpoint = {
  path: '/kb/comment',
  method: 'post',
  handler: async (req) => {
    const visitor = visitorOf(req)
    const body = await readBody(req)
    if (isBot(body)) return reply(req, visitor, { ok: true, pending: true })
    const s = await settingsOf(req)
    if (!s.comments) return reply(req, visitor, { error: 'Comments are switched off.' }, 403)
    const post = await postOf(req, body.post)
    if (!post) return reply(req, visitor, { error: 'That post was not found.' }, 404)
    const name = text(body.name, 60)
    const email = text(body.email, 200)
    const words = text(body.body, 2000)
    const errors: Record<string, string> = {}
    if (name.length < 2) errors.name = 'Please add your name (or a nickname).'
    if (email && !EMAIL.test(email)) errors.email = 'That email does not look right. It is optional, so you can leave it empty.'
    if (words.length < 2) errors.body = 'Write a few words first.'
    if (Object.keys(errors).length) return reply(req, visitor, { errors }, 400)
    if (tooMany(`c|${visitor.id}`, 8) || tooMany(`c|${req.headers.get('x-forwarded-for') ?? ''}`, 15)) return reply(req, visitor, { error: 'That is a lot of comments in a short time. Please try again in a few minutes.' }, 429)

    const verdict = worst(moderate(words, { blocked: s.blocked, holdAll: s.holdAll }), moderate(name, { blocked: s.blocked }))
    if (verdict.action === 'reject') return reply(req, visitor, { errors: { body: REJECT_MESSAGE } }, 400)

    let parent = idOf(body.parent)
    if (parent) {
      const p = (await req.payload.findByID({ collection: 'kb-comments' as never, id: parent, depth: 0, overrideAccess: true }).catch(() => null)) as { post?: number } | null
      if (!p || p.post !== post.id) parent = undefined
    }
    const doc = (await req.payload.create({
      collection: 'kb-comments' as never,
      data: { name, email: email || undefined, body: words, post: post.id, parent, status: verdict.action === 'hold' ? 'pending' : 'published', reason: verdict.reason, visitor: visitor.id } as never,
      overrideAccess: true,
    })) as unknown as { id: number; createdAt: string }
    await tellOwner(req, s, {
      subject: `${parent ? 'New reply' : 'New comment'} on “${post.title}”${verdict.action === 'hold' ? ' (needs approval)' : ''}`,
      heading: `${name} ${parent ? 'replied' : 'commented'} on “${post.title}”`,
      intro: heldNote(verdict),
      rows: [{ label: 'Comment', value: words }, ...(email ? [{ label: 'Email', value: email }] : []), { label: 'Post', value: `/notes/${post.slug}` }],
      adminPath: `collections/kb-comments/${doc.id}`,
      replyTo: email || undefined,
    })
    return reply(req, visitor, {
      ok: true,
      pending: verdict.action === 'hold',
      comment: { id: doc.id, parent: parent ?? null, name, body: words, likes: 0, liked: false, pending: verdict.action === 'hold', mine: true, createdAt: doc.createdAt },
    })
  },
}

/** POST /api/kb/like {comment}: likes a comment, or takes the like back. */
const like: Endpoint = {
  path: '/kb/like',
  method: 'post',
  handler: async (req) => {
    const visitor = visitorOf(req)
    const body = await readBody(req)
    const id = idOf(body.comment)
    const doc = id ? ((await req.payload.findByID({ collection: 'kb-comments' as never, id, depth: 0, overrideAccess: true }).catch(() => null)) as { id: number; likes?: number; status: string } | null) : null
    if (!doc || doc.status !== 'published') return reply(req, visitor, { error: 'That comment was not found.' }, 404)
    if (tooMany(`l|${visitor.id}`, 60)) return reply(req, visitor, { error: 'Slow down a little.' }, 429)
    const where: Where = { and: [{ kind: { equals: 'like' } }, { target: { equals: String(id) } }, { visitor: { equals: visitor.id } }] }
    const existing = (await req.payload.find({ collection: 'kb-votes' as never, where, depth: 0, limit: 1, overrideAccess: true })).docs[0]
    if (existing) await req.payload.delete({ collection: 'kb-votes' as never, where, overrideAccess: true })
    else await req.payload.create({ collection: 'kb-votes' as never, data: { kind: 'like', target: String(id), visitor: visitor.id } as never, overrideAccess: true })
    const likes = (await req.payload.count({ collection: 'kb-votes' as never, where: { and: [{ kind: { equals: 'like' } }, { target: { equals: String(id) } }] }, overrideAccess: true })).totalDocs
    await req.payload.update({ collection: 'kb-comments' as never, id: doc.id, data: { likes } as never, overrideAccess: true })
    return reply(req, visitor, { ok: true, liked: !existing, likes })
  },
}

/** POST /api/kb/star {channel}: stars a channel, or takes the star back. */
const star: Endpoint = {
  path: '/kb/star',
  method: 'post',
  handler: async (req) => {
    const visitor = visitorOf(req)
    const body = await readBody(req)
    const id = idOf(body.channel)
    const channel = id ? await req.payload.findByID({ collection: 'categories', id, depth: 0 }).catch(() => null) : null
    if (!channel) return reply(req, visitor, { error: 'That channel was not found.' }, 404)
    if (tooMany(`s|${visitor.id}`, 40)) return reply(req, visitor, { error: 'Slow down a little.' }, 429)
    const where: Where = { and: [{ kind: { equals: 'star' } }, { target: { equals: String(id) } }, { visitor: { equals: visitor.id } }] }
    const existing = (await req.payload.find({ collection: 'kb-votes' as never, where, depth: 0, limit: 1, overrideAccess: true })).docs[0]
    if (existing) await req.payload.delete({ collection: 'kb-votes' as never, where, overrideAccess: true })
    else await req.payload.create({ collection: 'kb-votes' as never, data: { kind: 'star', target: String(id), visitor: visitor.id } as never, overrideAccess: true })
    const count = (await req.payload.count({ collection: 'kb-votes' as never, where: { and: [{ kind: { equals: 'star' } }, { target: { equals: String(id) } }] }, overrideAccess: true })).totalDocs
    return reply(req, visitor, { ok: true, starred: !existing, count })
  },
}

/** POST /api/kb/review {post, rating 1–5, review?, name?}: one rating per visitor per post; again updates it. */
const review: Endpoint = {
  path: '/kb/review',
  method: 'post',
  handler: async (req) => {
    const visitor = visitorOf(req)
    const body = await readBody(req)
    if (isBot(body)) return reply(req, visitor, { ok: true })
    const s = await settingsOf(req)
    if (!s.reviews) return reply(req, visitor, { error: 'Ratings are switched off.' }, 403)
    const post = await postOf(req, body.post)
    if (!post) return reply(req, visitor, { error: 'That post was not found.' }, 404)
    const rating = Math.round(Number(body.rating))
    if (!(rating >= 1 && rating <= 5)) return reply(req, visitor, { errors: { rating: 'Pick 1 to 5 stars.' } }, 400)
    const words = text(body.review, 1000)
    const name = text(body.name, 60)
    if (tooMany(`r|${visitor.id}`, 10)) return reply(req, visitor, { error: 'That is a lot of ratings in a short time. Please try again in a few minutes.' }, 429)
    const verdict = words || name ? worst(moderate(words, { blocked: s.blocked, holdAll: s.holdAll && Boolean(words) }), moderate(name, { blocked: s.blocked })) : ({ action: 'publish' } as Verdict)
    if (verdict.action === 'reject') return reply(req, visitor, { errors: { review: REJECT_MESSAGE } }, 400)
    const data = { rating, review: words || null, name: name || null, post: post.id, status: verdict.action === 'hold' ? 'pending' : 'published', reason: verdict.reason ?? null, visitor: visitor.id }
    const where: Where = { and: [{ post: { equals: post.id } }, { visitor: { equals: visitor.id } }] }
    const existing = (await req.payload.find({ collection: 'kb-reviews' as never, where, depth: 0, limit: 1, overrideAccess: true })).docs[0] as { id: number; rating: number; review?: string } | undefined
    const doc = existing
      ? ((await req.payload.update({ collection: 'kb-reviews' as never, id: existing.id, data: data as never, overrideAccess: true })) as unknown as { id: number })
      : ((await req.payload.create({ collection: 'kb-reviews' as never, data: data as never, overrideAccess: true })) as unknown as { id: number })
    // Only a new or changed written review is worth an email; a bare star rating is not.
    if (words && words !== (existing?.review ?? '')) {
      await tellOwner(req, s, {
        subject: `${'★'.repeat(rating)}${'☆'.repeat(5 - rating)} review of “${post.title}”${verdict.action === 'hold' ? ' (needs approval)' : ''}`,
        heading: `${name || 'A reader'} rated “${post.title}” ${rating}/5`,
        intro: heldNote(verdict),
        rows: [{ label: 'Review', value: words }, { label: 'Post', value: `/notes/${post.slug}` }],
        adminPath: `collections/kb-reviews/${doc.id}`,
      })
    }
    return reply(req, visitor, { ok: true, pending: verdict.action === 'hold' })
  },
}

/** POST /api/kb/feedback {post, kind, quote?, note?, email?}: feedback on selected text, emailed to you. */
const feedback: Endpoint = {
  path: '/kb/feedback',
  method: 'post',
  handler: async (req) => {
    const visitor = visitorOf(req)
    const body = await readBody(req)
    if (isBot(body)) return reply(req, visitor, { ok: true })
    const s = await settingsOf(req)
    if (!s.feedback) return reply(req, visitor, { error: 'Feedback is switched off.' }, 403)
    const post = await postOf(req, body.post)
    if (!post) return reply(req, visitor, { error: 'That post was not found.' }, 404)
    const kind = ['wrong', 'simpler', 'other'].includes(String(body.kind)) ? String(body.kind) : 'other'
    const quote = text(body.quote, 1000)
    const note = text(body.note, 2000)
    const email = text(body.email, 200)
    if (!quote && !note) return reply(req, visitor, { errors: { note: 'Tell me a little about it.' } }, 400)
    if (email && !EMAIL.test(email)) return reply(req, visitor, { errors: { email: 'That email does not look right. It is optional.' } }, 400)
    if (moderate(note, { blocked: s.blocked }).action === 'reject') return reply(req, visitor, { errors: { note: REJECT_MESSAGE } }, 400)
    if (tooMany(`f|${visitor.id}`, 10) || tooMany(`f|${req.headers.get('x-forwarded-for') ?? ''}`, 20)) return reply(req, visitor, { error: 'That is a lot of feedback in a short time. Please try again in a few minutes.' }, 429)
    const doc = (await req.payload.create({ collection: 'kb-feedback' as never, data: { kind, quote, note, email: email || undefined, post: post.id, visitor: visitor.id } as never, overrideAccess: true })) as unknown as { id: number }
    const label = { wrong: 'Looks wrong', simpler: 'Could be simpler', other: 'Feedback' }[kind]
    const alert = await tellOwner(req, s, {
      subject: `${label}: “${post.title}”`,
      heading: `${label} on “${post.title}”`,
      intro: 'A reader sent feedback on your post.',
      rows: [...(quote ? [{ label: 'Selected text', value: quote }] : []), ...(note ? [{ label: 'What they said', value: note }] : []), ...(email ? [{ label: 'Email', value: email }] : []), { label: 'Post', value: `/notes/${post.slug}` }],
      adminPath: `collections/kb-feedback/${doc.id}`,
      replyTo: email || undefined,
    })
    await req.payload.update({ collection: 'kb-feedback' as never, id: doc.id, data: { alert } as never, overrideAccess: true }).catch(() => undefined)
    return reply(req, visitor, { ok: true })
  },
}

export const kbEndpoints: Endpoint[] = [thread, stars, comment, like, star, review, feedback]
