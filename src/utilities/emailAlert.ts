import type { ContactSettings } from './contactFields'
import type { Payload } from 'payload'
import { emailLook, fill, formatFrom, renderEmail, type EmailTemplate, type EmailVars } from './emailTemplate'

/**
 * Contact page emails, sent through Resend (resend.com, free up to 3,000 emails a month).
 * Needs RESEND_API_KEY. The sender is set in the admin (Contact page → Email alerts) and must be on a
 * domain verified in Resend; without one, CONTACT_FROM_EMAIL is used, then Resend's shared address,
 * which can only send to the email address of your own Resend account.
 */
export const emailAlertsReady = () => Boolean(process.env.RESEND_API_KEY)

/** The sender address, and the name that goes with it. */
export function sender(settings: Pick<ContactSettings, 'fromName' | 'fromEmail'>, vars: EmailVars): { from: string; address: string } {
  const env = (process.env.CONTACT_FROM_EMAIL ?? '').trim()
  const envAddress = env.match(/<([^>]+)>/)?.[1] ?? (env.includes('@') ? env : '')
  const address = settings.fromEmail || envAddress || 'onboarding@resend.dev'
  return { from: formatFrom(fill(settings.fromName, vars) || vars.site, address), address }
}

export async function sendEmail(input: { from: string; to: string; replyTo?: string; subject: string; text: string; html: string }): Promise<{ ok: true } | { ok: false; reason: string }> {
  const key = process.env.RESEND_API_KEY
  if (!key) return { ok: false, reason: 'RESEND_API_KEY is not set' }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: input.from,
        to: [input.to],
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
        subject: input.subject,
        text: input.text,
        html: input.html,
      }),
      signal: AbortSignal.timeout(8000),
    })
    if (res.ok) return { ok: true }
    const body = (await res.json().catch(() => ({}))) as { message?: string }
    return { ok: false, reason: body.message || `Resend answered ${res.status}` }
  } catch (e) {
    return { ok: false, reason: (e as Error).message || 'could not reach Resend' }
  }
}

/** The site theme (Site-wide → Theme), for emails that look like the site. */
export async function siteAppearance(payload: Payload): Promise<Record<string, unknown> | null> {
  return (await payload.findGlobal({ slug: 'appearance' as never, depth: 0 }).catch(() => null)) as Record<string, unknown> | null
}

/** Renders a template from the settings, in the site theme's colours, and sends it. */
export function sendTemplate(
  settings: ContactSettings,
  template: EmailTemplate,
  vars: EmailVars,
  answers: { label: string; value: string }[],
  opts: { to: string; replyTo?: string; buttonHref?: string; appearance: Record<string, unknown> | null },
) {
  const email = renderEmail(template, vars, answers, { look: emailLook(opts.appearance, settings.accent), buttonHref: opts.buttonHref })
  return sendEmail({ from: sender(settings, vars).from, to: opts.to, replyTo: opts.replyTo, ...email })
}
