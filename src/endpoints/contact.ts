import type { Endpoint } from 'payload'
import { checkAnswer, toContactSettings } from '@/utilities/contactFields'

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

    try {
      await req.payload.create({
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
    } catch (e) {
      req.payload.logger.error({ err: e }, 'contact form: could not store message')
      return Response.json({ error: 'Your message could not be sent just now. Please email me instead.' }, { status: 500 })
    }
    return Response.json({ ok: true })
  },
}
