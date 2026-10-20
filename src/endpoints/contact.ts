import { createHash } from 'node:crypto'
import type { Endpoint } from 'payload'
import { checkAnswer, toContactSettings, type ContactSettings } from '@/utilities/contactFields'
import { sameOrigin } from '@/utilities/sameOrigin'
import { emailAlertsReady, sendTemplate, siteAppearance } from '@/utilities/emailAlert'
import { SAMPLE, type EmailVars } from '@/utilities/emailTemplate'

const recent = new Map<string, number[]>()

/** At most 5 messages per visitor per 10 minutes (per server instance; a light brake, not a wall). */
export function limited(key: string): boolean {
  const now = Date.now()
  const times = (recent.get(key) ?? []).filter((t) => now - t < 10 * 60 * 1000)
  times.push(now)
  recent.set(key, times)
  if (recent.size > 5000) recent.clear()
  return times.length > 5
}

/**
 * POST /api/contact: the Contact page chat and form. Every answer is checked against the questions set
 * in the admin, bots are dropped (a hidden field people never fill, and answers faster than anyone
 * types), and the message is stored in Messages with all its answers.
 */
export const contact: Endpoint = {
  path: '/contact',
  method: 'post',
  handler: async (req) => {
    if (!sameOrigin(req)) return Response.json({ error: 'Please send your message from the Contact page.' }, { status: 403 })
    let body: Record<string, unknown>
    try {
      body = (await req.json?.()) as Record<string, unknown>
    } catch {
      return Response.json({ error: 'Something went wrong reading the form. Please try again.' }, { status: 400 })
    }
    const answers = (body.answers && typeof body.answers === 'object' ? body.answers : {}) as Record<string, unknown>
    const startedAt = Number(body.startedAt)
    // Bots: they fill the hidden "website" field, or submit instantly. Pretend it worked.
    if ((typeof body.website === 'string' && body.website.trim()) || (Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < 2500)) return Response.json({ ok: true })

    const settings = toContactSettings((await req.payload.findGlobal({ slug: 'contact-page' as never, depth: 0 })) as unknown as Record<string, unknown>)
    const errors: Record<string, string> = {}
    const clean: Record<string, string> = {}
    for (const field of settings.fields) {
      const result = checkAnswer(field, answers[field.key])
      if (result.ok) clean[field.key] = result.value
      else errors[field.key] = result.error
    }
    if (Object.keys(errors).length) return Response.json({ errors }, { status: 400 })

    const first = (type: string) => settings.fields.find((f) => f.type === type && clean[f.key])?.key
    const name = clean[first('name') ?? ''] ?? ''
    const email = clean[first('email') ?? ''] ?? ''
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    // A keyed hash of the address (never the address) counts messages across every server instance.
    const ipHash = createHash('sha256').update(`${process.env.PAYLOAD_SECRET ?? ''}|${ip}`).digest('hex').slice(0, 24)
    const lastTen = (await req.payload.count({ collection: 'messages' as never, where: { and: [{ ipHash: { equals: ipHash } }, { createdAt: { greater_than: new Date(Date.now() - 10 * 60_000).toISOString() } }] }, overrideAccess: true })).totalDocs
    if (limited(`${ip}|${email.toLowerCase()}`) || lastTen >= 5) return Response.json({ error: 'That is a lot of messages in a short time. Please try again in a few minutes.' }, { status: 429 })

    let id: number | string
    try {
      const doc = await req.payload.create({
        collection: 'messages' as never,
        data: {
          name,
          email,
          phone: clean[first('phone') ?? ''] || undefined,
          topic: clean[first('choice') ?? ''] || undefined,
          message: clean[first('textarea') ?? ''] ?? '',
          answers: settings.fields.filter((f) => clean[f.key]).map((f) => ({ question: f.label, answer: clean[f.key] })),
          page: typeof body.page === 'string' ? body.page.slice(0, 300) : '/contact',
          ipHash,
        } as never,
        overrideAccess: true,
      })
      id = (doc as { id: number | string }).id
    } catch (e) {
      req.payload.logger.error({ err: e }, 'contact form: could not store message')
      return Response.json({ error: 'Your message could not be sent just now. Please email me instead.' }, { status: 500 })
    }
    // The emails never hold up or undo the message; how the alert went is noted on the message.
    const site = await siteInfo(req.payload)
    const vars: EmailVars = { name, email, topic: clean[first('choice') ?? ''], site: site.name, url: site.url }
    const answerRows = settings.fields.filter((f) => clean[f.key]).map((f) => ({ label: f.label, value: clean[f.key] }))
    const [alert] = await Promise.all([alertOwner(settings, site, vars, answerRows), thankVisitor(settings, site, vars, answerRows)])
    await req.payload.update({ collection: 'messages' as never, id, data: { alert } as never, overrideAccess: true }).catch(() => undefined)
    return Response.json({ ok: true })
  },
}

type PayloadLike = Parameters<Endpoint['handler']>[0]['payload']
export type Site = { name: string; url: string; email?: string; appearance: Record<string, unknown> | null }

/** Your name, site address and email from Site-wide → Name & profiles, for the emails. */
export async function siteInfo(payload: PayloadLike): Promise<Site> {
  const [s, appearance] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings' as never, depth: 0 }).catch(() => null) as Promise<{ displayName?: string; fullName?: string; canonicalUrl?: string; email?: string } | null>,
    siteAppearance(payload),
  ])
  return { name: s?.fullName || s?.displayName || 'My website', url: (s?.canonicalUrl || process.env.NEXT_PUBLIC_SERVER_URL || '').replace(/\/$/, ''), email: s?.email || undefined, appearance }
}

/** Who gets alerts: the address set on the Contact page, or the site's email. */
export const alertRecipient = (settings: ContactSettings, site: Site) => settings.notifyEmail || site.email

async function alertOwner(settings: ContactSettings, site: Site, vars: EmailVars, answers: { label: string; value: string }[]): Promise<string> {
  if (!settings.notify) return 'Off (Contact page → Email alerts)'
  if (!emailAlertsReady()) return 'Not sent: RESEND_API_KEY is not set'
  const to = alertRecipient(settings, site)
  if (!to) return 'Not sent: no address to send to'
  const result = await sendTemplate(settings, settings.alertEmail, vars, answers, { to, replyTo: vars.email, buttonHref: `mailto:${vars.email}`, appearance: site.appearance })
  return result.ok ? `Emailed to ${to}` : `Not sent: ${result.reason}`
}

/** The optional "thanks" email to the visitor; replies to it come to you. */
async function thankVisitor(settings: ContactSettings, site: Site, vars: EmailVars, answers: { label: string; value: string }[]) {
  if (!settings.confirm || !emailAlertsReady() || !vars.email) return
  await sendTemplate(settings, settings.confirmEmail, vars, answers, { to: vars.email, replyTo: alertRecipient(settings, site), buttonHref: site.url || undefined, appearance: site.appearance })
}

/**
 * POST /api/contact-test: sends a sample alert (or "thanks" email) using the settings on screen, saved
 * or not, so the admin can try them before saving. Signed-in admins only.
 */
export const contactTest: Endpoint = {
  path: '/contact-test',
  method: 'post',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    const body = ((await req.json?.().catch(() => null)) ?? {}) as { kind?: string; draft?: Record<string, unknown> }
    const saved = (await req.payload.findGlobal({ slug: 'contact-page' as never, depth: 0 })) as unknown as Record<string, unknown>
    const settings = toContactSettings({ ...saved, ...(body.draft && typeof body.draft === 'object' ? body.draft : {}) })
    if (!emailAlertsReady()) return Response.json({ ok: false, message: 'RESEND_API_KEY is not set yet, so no email can be sent.' })
    const site = await siteInfo(req.payload)
    const to = alertRecipient(settings, site)
    if (!to) return Response.json({ ok: false, message: 'There is no address to send to: set "Send alerts to", or an email in Site-wide → Name & profiles.' })
    const vars: EmailVars = { name: SAMPLE.name, email: SAMPLE.email, topic: SAMPLE.topic, site: site.name, url: site.url }
    const thanks = body.kind === 'confirm'
    const result = await sendTemplate(settings, thanks ? settings.confirmEmail : settings.alertEmail, vars, SAMPLE.answers, {
      to,
      buttonHref: thanks ? site.url || undefined : `mailto:${SAMPLE.email}`,
      appearance: site.appearance,
    })
    return Response.json(
      result.ok
        ? { ok: true, message: `Sample ${thanks ? '"thanks" email' : 'alert'} sent to ${to}. Check your inbox (and spam, the first time).` }
        : { ok: false, message: `Not sent: ${result.reason}` },
    )
  },
}
