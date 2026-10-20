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

/** The colours of an email, taken from the site theme (see emailLook). */
export type EmailLook = { mode: 'dark' | 'light'; background: string; card: string; text: string; soft: string; muted: string; line: string; accent: string; accentInk: string }

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
/** Empty: the email uses the site theme's accent colour. */
export const DEFAULT_ACCENT = ''

const PRESET = {
  dark: { background: '#000000', surface: '#1c1c1e', text: '#f2f2f2', muted: '#8a8a8e', line: '#2c2c2e' },
  light: { background: '#f3f2ee', surface: '#e6e5e0', text: '#121212', muted: '#6b6b6b', line: '#d9d8d2' },
}
const ACCENTS: Record<string, { dark: string; light: string; ink?: string }> = {
  blue: { dark: '#3d8bff', light: '#3d8bff' },
  orange: { dark: '#ff5a1f', light: '#ff5a1f' },
  green: { dark: '#3ccf7a', light: '#3ccf7a', ink: '#04140a' },
  violet: { dark: '#a78bfa', light: '#a78bfa', ink: '#120a2a' },
  neutral: { dark: '#e5e5e5', light: '#111111' },
}
const HEXC = /^#[0-9a-f]{6}$/i
const pickHex = (...v: unknown[]) => v.find((x): x is string => typeof x === 'string' && HEXC.test(x))

/** Black or white text, whichever reads better on a colour. */
function inkFor(hex: string): string {
  const n = parseInt(hex.slice(1), 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  return 0.299 * r + 0.587 * g + 0.114 * b > 160 ? '#000000' : '#ffffff'
}

/**
 * The email's colours from the site theme (Site-wide → Theme): its default mode (dark or light),
 * the accent preset, and any custom colours, so emails look like the site. `accentOverride` is
 * the optional accent set on the Contact page.
 */
export function emailLook(appearance: Record<string, unknown> | null | undefined, accentOverride?: string): EmailLook {
  const a = appearance ?? {}
  const mode: 'dark' | 'light' = a.theme === 'light' ? 'light' : 'dark'
  const p = mode === 'dark' ? 'color' : 'light'
  const c = (k: string) => a[`${p}${k}`]
  const base = PRESET[mode]
  const preset = ACCENTS[String(a.accent)] ?? ACCENTS.blue
  const background = pickHex(c('Background')) ?? base.background
  const surface = pickHex(c('Surface')) ?? base.surface
  const text = pickHex(c('Text')) ?? base.text
  const accent = pickHex(accentOverride?.trim(), c('Accent')) ?? preset[mode]
  return {
    mode,
    // Dark: the page is the background and the card the surface; light: the other way round.
    background: mode === 'dark' ? background : surface,
    card: mode === 'dark' ? surface : background,
    text,
    soft: text,
    muted: pickHex(c('Muted')) ?? base.muted,
    line: pickHex(c('Line')) ?? base.line,
    accent,
    accentInk: pickHex(accentOverride) || pickHex(c('Accent')) ? inkFor(accent) : (preset.ink ?? inkFor(accent)),
  }
}

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


/** Renders one email: a subject, a plain-text body and an HTML body that works in Gmail, Outlook and Apple Mail. */
export function renderEmail(
  t: EmailTemplate,
  v: EmailVars,
  answers: { label: string; value: string }[],
  opts: { look: EmailLook; buttonHref?: string },
): { subject: string; text: string; html: string } {
  const k = opts.look
  const accent = k.accent
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
      (a) => `<tr><td style="padding:12px 0;border-top:1px solid ${k.line}">
<div style="font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:${k.muted};margin:0 0 4px">${esc(a.label)}</div>
<div style="font-size:15px;line-height:1.55;color:${k.text};white-space:pre-wrap">${esc(a.value).replace(/\n/g, '<br>')}</div>
</td></tr>`,
    )
    .join('\n')

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="${k.mode}"><meta name="supported-color-schemes" content="${k.mode}"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:${k.background};font-family:${font}">
<div style="display:none;max-height:0;overflow:hidden">${esc(intro.split('\n')[0] ?? '')}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${k.background}"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${k.card};border-radius:14px;border:1px solid ${k.line}">
<tr><td style="height:4px;background:${accent};border-radius:14px 14px 0 0;font-size:0;line-height:0">&nbsp;</td></tr>
<tr><td style="padding:26px 28px 6px">
<div style="font-size:13px;font-weight:700;letter-spacing:.02em;color:${k.text};margin:0 0 18px">${esc(v.site)}<span style="color:${accent}">.</span></div>
${heading ? `<h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:${k.text}">${esc(heading)}</h1>` : ''}
${paragraphs(intro, `margin:0 0 12px;font-size:15px;line-height:1.6;color:${k.soft};opacity:.85`)}
</td></tr>
${rows ? `<tr><td style="padding:6px 28px 4px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table></td></tr>` : ''}
${button && opts.buttonHref ? `<tr><td style="padding:16px 28px 8px"><a href="${esc(opts.buttonHref)}" style="display:inline-block;background:${accent};color:${k.accentInk};text-decoration:none;font-weight:600;font-size:15px;padding:11px 20px;border-radius:999px">${esc(button)}</a></td></tr>` : ''}
<tr><td style="padding:18px 28px 26px">${paragraphs(footer, `margin:0;font-size:12px;line-height:1.55;color:${k.muted}`)}</td></tr>
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
