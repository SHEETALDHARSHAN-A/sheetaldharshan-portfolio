/**
 * The Contact page emails, set in the admin (Contact page → Email alerts): the alert you get for each
 * message, and an optional "thanks" email to the visitor. Pure functions, so the admin preview and the
 * server render exactly the same email.
 *
 * Placeholders, filled in everywhere: {name}, {first}, {email}, {topic}, {site} (your name) and {url}.
 */
export type EmailTemplate = {
  subject: string
  heading: string
  intro: string
  /** Show every answer from the form or chat. */
  showAnswers: boolean
  /** Button text; empty hides the button. The alert's button replies to the visitor, the thanks email's opens your site. */
  button: string
  footer: string
}

export type EmailLook = { accent: string }

export const DEFAULT_ALERT: EmailTemplate = {
  subject: 'New message from {name} · {topic}',
  heading: 'New message from {name}',
  intro: '{name} wrote to you through the Contact page.',
  showAnswers: true,
  button: 'Reply to {name}',
  footer: 'Sent by the Contact page on {url}. Replying to this email answers {name} directly.',
}

export const DEFAULT_CONFIRM: EmailTemplate = {
  subject: 'Thanks for your message, {name}',
  heading: 'Thanks, {name}!',
  intro: "I've got your message and I'll reply to {email} soon.",
  showAnswers: true,
  button: 'Visit {url}',
  footer: "You're getting this because someone used the Contact page on {url} with this address. If it wasn't you, you can ignore this email.",
}

export const DEFAULT_FROM_NAME = '{site} · Contact'
export const DEFAULT_ACCENT = '#ff3400'

export type EmailVars = { name: string; email: string; topic?: string; site: string; url: string }

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

/** Fills the placeholders and tidies what an empty one leaves behind, e.g. "from Ada · " → "from Ada". */
export function fill(text: string, v: EmailVars): string {
  const host = v.url.replace(/^https?:\/\//, '').replace(/\/$/, '')
  const values: Record<string, string> = { name: v.name, first: v.name.split(/\s+/)[0] ?? '', email: v.email, topic: v.topic ?? '', site: v.site, url: host }
  return text
    .replace(/\{(name|first|email|topic|site|url)\}/g, (_, k: string) => values[k] ?? '')
    .split('\n')
    .map((line) => line.replace(/[ \t]+([·|,:–—-])[ \t]*$/, '').replace(/^[ \t]*[·|–—-][ \t]+/, '').replace(/[ \t]{2,}/g, ' ').trimEnd())
    .join('\n')
    .trim()
}

const paragraphs = (text: string, style: string) =>
  text
    .split(/\n[ \t]*\n/)
    .filter((p) => p.trim())
    .map((p) => `<p style="${style}">${esc(p).replace(/\n/g, '<br>')}</p>`)
    .join('\n')

const safeColour = (c: string) => (/^#[0-9a-f]{3,8}$/i.test(c.trim()) ? c.trim() : DEFAULT_ACCENT)

/** Renders one email: a subject, a plain-text body and an HTML body that works in Gmail, Outlook and Apple Mail. */
export function renderEmail(
  t: EmailTemplate,
  v: EmailVars,
  answers: { label: string; value: string }[],
  opts: { look: EmailLook; buttonHref?: string },
): { subject: string; text: string; html: string } {
  const accent = safeColour(opts.look.accent)
  const subject = fill(t.subject, v).replace(/\s+/g, ' ') || 'New message'
  const heading = fill(t.heading, v)
  const intro = fill(t.intro, v)
  const button = fill(t.button, v)
  const footer = fill(t.footer, v)
  const shown = t.showAnswers ? answers.filter((a) => a.value.trim()) : []

  const text = [heading, intro, ...shown.map((a) => `${a.label}:\n${a.value}`), button && opts.buttonHref ? `${button}: ${opts.buttonHref.replace(/^mailto:/, '')}` : '', footer ? `--\n${footer}` : '']
    .filter(Boolean)
    .join('\n\n')

  const font = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"
  const rows = shown
    .map(
      (a) => `<tr><td style="padding:12px 0;border-top:1px solid #ecece8">
<div style="font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:#8a8a85;margin:0 0 4px">${esc(a.label)}</div>
<div style="font-size:15px;line-height:1.55;color:#1b1b1b;white-space:pre-wrap">${esc(a.value).replace(/\n/g, '<br>')}</div>
</td></tr>`,
    )
    .join('\n')

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#f1f2e9;font-family:${font}">
<div style="display:none;max-height:0;overflow:hidden">${esc(intro.split('\n')[0] ?? '')}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f2e9"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;border:1px solid #e3e4da">
<tr><td style="height:4px;background:${accent};border-radius:14px 14px 0 0;font-size:0;line-height:0">&nbsp;</td></tr>
<tr><td style="padding:26px 28px 6px">
<div style="font-size:13px;font-weight:700;color:#1b1b1b;margin:0 0 18px">${esc(v.site)}<span style="color:${accent}">.</span></div>
${heading ? `<h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:#1b1b1b">${esc(heading)}</h1>` : ''}
${paragraphs(intro, 'margin:0 0 12px;font-size:15px;line-height:1.6;color:#3a3a37')}
</td></tr>
${rows ? `<tr><td style="padding:6px 28px 4px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table></td></tr>` : ''}
${button && opts.buttonHref ? `<tr><td style="padding:16px 28px 8px"><a href="${esc(opts.buttonHref)}" style="display:inline-block;background:${accent};color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:11px 20px;border-radius:999px">${esc(button)}</a></td></tr>` : ''}
<tr><td style="padding:18px 28px 26px">${paragraphs(footer, 'margin:0;font-size:12px;line-height:1.55;color:#8a8a85')}</td></tr>
</table>
</td></tr></table>
</body></html>`
  return { subject, text, html }
}

/** The sender as "Name <address>", with the name cleaned so it can't break the header. */
export function formatFrom(name: string, address: string): string {
  const clean = name.replace(/["<>\r\n]/g, '').trim()
  return clean ? `"${clean}" <${address}>` : address
}

/** Reads a template group saved in the admin, falling back to the defaults field by field. */
export function toTemplate(doc: unknown, fallback: EmailTemplate): EmailTemplate {
  const d = (doc && typeof doc === 'object' ? doc : {}) as Record<string, unknown>
  const str = (v: unknown, f: string) => (typeof v === 'string' ? v : f)
  return {
    subject: str(d.subject, fallback.subject).trim() || fallback.subject,
    heading: str(d.heading, fallback.heading),
    intro: str(d.intro, fallback.intro),
    showAnswers: d.showAnswers !== false,
    button: str(d.button, fallback.button),
    footer: str(d.footer, fallback.footer),
  }
}

/** Sample answers for the admin preview and the test emails. */
export const SAMPLE = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  topic: 'A project',
  answers: [
    { label: 'Your name', value: 'Ada Lovelace' },
    { label: 'Your email', value: 'ada@example.com' },
    { label: "What's it about?", value: 'A project' },
    { label: 'Message', value: "Hi! I'm building an analytics tool and liked your recent write-up.\nWould you be up for a quick chat next week?" },
  ],
}
