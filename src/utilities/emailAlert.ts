/**
 * Email alerts for the Contact page, sent through Resend (resend.com, free up to 3,000 emails a month).
 * Needs RESEND_API_KEY. The sender defaults to Resend's shared address, which can only send to the
 * email address of your own Resend account; with your own domain verified there, set
 * CONTACT_FROM_EMAIL (for example "Portfolio <hello@yourdomain.com>").
 */
export const emailAlertsReady = () => Boolean(process.env.RESEND_API_KEY)

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

export async function sendEmailAlert(input: { to: string; replyTo?: string; subject: string; rows: { label: string; value: string }[]; footer?: string }): Promise<{ ok: true } | { ok: false; reason: string }> {
  const key = process.env.RESEND_API_KEY
  if (!key) return { ok: false, reason: 'RESEND_API_KEY is not set' }
  const text = [...input.rows.map((r) => `${r.label}:\n${r.value}\n`), input.footer ?? ''].join('\n')
  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.5;color:#111">
${input.rows.map((r) => `<p style="margin:0 0 14px"><span style="color:#666;font-size:13px">${esc(r.label)}</span><br>${esc(r.value).replace(/\n/g, '<br>')}</p>`).join('\n')}
${input.footer ? `<p style="margin:20px 0 0;color:#888;font-size:12px">${esc(input.footer)}</p>` : ''}
</div>`
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || 'Portfolio <onboarding@resend.dev>',
        to: [input.to],
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
        subject: input.subject,
        text,
        html,
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
