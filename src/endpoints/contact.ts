import type { Endpoint } from 'payload'
import { checkAnswer, toContactSettings, type ContactSettings } from '@/utilities/contactFields'
import { emailAlertsReady, sendEmailAlert } from '@/utilities/emailAlert'

const recent = new Map<string, number[]>()

/** At most 5 messages per visitor per 10 minutes (per server instance; a light brake, not a wall). */
function limited(key: string): boolean {
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
    if (limited(`${ip}|${email.toLowerCase()}`)) return Response.json({ error: 'That is a lot of messages in a short time. Please try again in a few minutes.' }, { status: 429 })

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
        } as never,
        overrideAccess: true,
      })
      id = (doc as { id: number | string }).id
    } catch (e) {
      req.payload.logger.error({ err: e }, 'contact form: could not store message')
      return Response.json({ error: 'Your message could not be sent just now. Please email me instead.' }, { status: 500 })
    }
    // The email alert never holds up or undoes the message; its outcome is noted on the message.
    const alert = await alertOwner(req.payload, settings, { name, email, topic: clean[first('choice') ?? ''], answers: settings.fields.filter((f) => clean[f.key]).map((f) => ({ label: f.label, value: clean[f.key] })) })
    await req.payload.update({ collection: 'messages' as never, id, data: { alert } as never, overrideAccess: true }).catch(() => undefined)
    return Response.json({ ok: true })
  },
}

type PayloadLike = Parameters<Endpoint['handler']>[0]['payload']

/** Who gets alerts: the address set on the Contact page, or the site's email. */
export async function alertRecipient(payload: PayloadLike, settings: ContactSettings): Promise<string | undefined> {
  if (settings.notifyEmail) return settings.notifyEmail
  const site = (await payload.findGlobal({ slug: 'site-settings' as never, depth: 0 }).catch(() => null)) as { email?: string } | null
  return site?.email || undefined
}

async function alertOwner(payload: PayloadLike, settings: ContactSettings, m: { name: string; email: string; topic?: string; answers: { label: string; value: string }[] }): Promise<string> {
  if (!settings.notify) return 'Off (Contact page → Email alerts)'
  if (!emailAlertsReady()) return 'Not sent: RESEND_API_KEY is not set'
  const to = await alertRecipient(payload, settings)
  if (!to) return 'Not sent: no address to send to'
  const result = await sendEmailAlert({
    to,
    replyTo: m.email,
    subject: `New message from ${m.name}${m.topic ? ` · ${m.topic}` : ''}`,
    rows: m.answers,
    footer: 'Sent from the Contact page. Reply to this email to answer them directly.',
  })
  return result.ok ? `Emailed to ${to}` : `Not sent: ${result.reason}`
}

/** POST /api/contact-test: sends a test alert to the configured address. Signed-in admins only. */
export const contactTest: Endpoint = {
  path: '/contact-test',
  method: 'post',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    const settings = toContactSettings((await req.payload.findGlobal({ slug: 'contact-page' as never, depth: 0 })) as unknown as Record<string, unknown>)
    if (!emailAlertsReady()) return Response.json({ ok: false, message: 'RESEND_API_KEY is not set yet, so no email can be sent.' })
    const to = await alertRecipient(req.payload, settings)
    if (!to) return Response.json({ ok: false, message: 'There is no address to send to: set one here, or an email in Site-wide → Name & profiles.' })
    const result = await sendEmailAlert({
      to,
      subject: 'Test: Contact page email alerts work',
      rows: [{ label: 'All good', value: 'New messages from your Contact page will arrive like this, with every answer. Reply to one to answer the visitor directly.' }],
    })
    return Response.json(result.ok ? { ok: true, message: `Test email sent to ${to}. Check your inbox (and spam, the first time).` } : { ok: false, message: `Not sent: ${result.reason}` })
  },
}

