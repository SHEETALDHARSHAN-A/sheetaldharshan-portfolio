/**
 * Contact page fields, set in the admin (Contact page → Form & chat). The same definitions drive the
 * chat, the form and the server-side checks, so a field added in the admin works everywhere.
 */
export type FieldType = 'name' | 'email' | 'phone' | 'text' | 'textarea' | 'choice'

export type ContactField = {
  key: string
  label: string
  question: string
  type: FieldType
  required: boolean
  placeholder?: string
  options: string[]
  retry?: string
  reply?: string
}

export type ContactSettings = {
  heading: string
  intro: string
  mode: 'both' | 'chat' | 'form'
  firstMode: 'chat' | 'form'
  greeting: string
  doneMessage: string
  formNote: string
  fields: ContactField[]
  /** Email me each new message (needs RESEND_API_KEY). */
  notify: boolean
  /** Where alerts go; empty means the email in Site settings. */
  notifyEmail?: string
}

export const DEFAULT_FIELDS: ContactField[] = [
  { key: 'name', label: 'Your name', question: "Let's get your message to me. What's your name?", type: 'name', required: true, placeholder: 'Ada Lovelace', options: [], retry: "Hmm, that doesn't look like a name. What should I call you?", reply: 'Nice to meet you, {first}!' },
  { key: 'email', label: 'Your email', question: "What's your email address, so I can reply?", type: 'email', required: true, placeholder: 'ada@example.com', options: [], retry: "That doesn't look like an email address. Could you check it? Something like ada@example.com.", reply: 'Got it.' },
  { key: 'phone', label: 'Phone', question: 'Would you like to add a phone number too? Type it, or say "skip".', type: 'phone', required: false, placeholder: '+91 98765 43210', options: [], retry: 'I couldn\'t read that as a phone number. Type it like +91 98765 43210, or say "skip".', reply: 'Thanks!' },
  { key: 'topic', label: "What's it about?", question: "What's it about?", type: 'choice', required: true, options: ['A role or opportunity', 'A project', 'Exasol or my projects', 'Just saying hi'], retry: 'Pick one of these, or tell me in a few words.', reply: 'Great.' },
  { key: 'message', label: 'Message', question: 'Tell me about it. A few lines is plenty.', type: 'textarea', required: true, placeholder: "Tell me a little about it: what you're working on, and how I can help.", options: [], retry: 'Could you tell me a little more? A sentence or two helps me reply properly.' },
]

export const DEFAULT_CONTACT: ContactSettings = {
  heading: 'Say hello',
  intro: 'Got a project in mind, a role to talk about, or a question about something I built? Send me a message here, or use whichever channel suits you.',
  mode: 'both',
  firstMode: 'form',
  greeting: 'Hi there 👋',
  doneMessage: "Done! Thanks, {first} 🙌 I'll reply to {email} soon.",
  formNote: 'Your details are only used to reply to you.',
  fields: DEFAULT_FIELDS,
  notify: true,
}

export const SKIP = /^(skip|no|nope|none|n\/a|na|-|no thanks|not now)$/i
export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const LIMIT: Record<FieldType, number> = { name: 120, email: 200, phone: 40, text: 300, textarea: 5000, choice: 200 }

/** Matches typed words to an option, e.g. "a job" → "A role or opportunity" (shared words or substrings). */
export function matchOption(text: string, options: string[]): string | null {
  const t = text.trim().toLowerCase()
  if (!t) return null
  const exact = options.find((o) => o.toLowerCase() === t)
  if (exact) return exact
  const contained = options.find((o) => o.toLowerCase().includes(t) || t.includes(o.toLowerCase()))
  if (contained) return contained
  const synonyms: [RegExp, RegExp][] = [
    [/(job|role|hire|hiring|position|opportunit|recruit|interview)/, /(role|job|opportunit)/],
    [/(project|build|freelance|idea|app|website|collab)/, /project/],
    [/(hi|hello|hey|chat|nothing|just)/, /(hi|hello|saying)/],
  ]
  for (const [said, option] of synonyms) if (said.test(t)) return options.find((o) => option.test(o.toLowerCase())) ?? null
  const words = t.split(/\W+/).filter((w) => w.length > 2)
  return options.find((o) => words.some((w) => o.toLowerCase().includes(w))) ?? null
}

/** Plain wording for the form; the chat uses each question's own "if the answer does not fit" line. */
const FORM_ERROR: Record<FieldType, string> = {
  name: 'Please enter your name.',
  email: 'Please enter a valid email address, like ada@example.com.',
  phone: 'Please enter a valid phone number (like +91 98765 43210), or leave it empty.',
  text: 'Please fill this in.',
  textarea: 'Please write at least a sentence (10 characters or more).',
  choice: 'Please pick one.',
}

/** "my name is ada lovelace", "Hi, I'm Ada!" → "Ada Lovelace" / "Ada": drops lead-in phrases and punctuation. */
export function extractName(text: string): string {
  let t = text.trim().replace(/^[\s"'“”]+|[\s"'“”.!?,;:]+$/g, '')
  const lead = /^(?:(?:hi|hello|hey|hiya|yo)[\s,!.]*)?(?:(?:my\s+(?:full\s+)?name\s+is|my\s+name'?s|name\s*[:=-]|i\s*am|i'm|im|this\s+is|it'?s|call\s+me|you\s+can\s+call\s+me|they\s+call\s+me)\s+)/i
  for (let i = 0; i < 2 && lead.test(t); i++) t = t.replace(lead, '').trim()
  t = t.replace(/^(?:hi|hello|hey)[\s,!.]+/i, '').replace(/[\s.!?,;:]+$/g, '').trim()
  // All lower case (or all upper): give it capitals; otherwise keep how they wrote it.
  if (t === t.toLowerCase() || t === t.toUpperCase()) t = t.toLowerCase().replace(/(^|[\s'-])\p{L}/gu, (m) => m.toUpperCase())
  return t
}

/** "my number is +91 98765 43210, thanks" → "+91 98765 43210". */
export function extractPhone(text: string): string {
  return text.match(/\+?\(?\d[\d\s().-]{5,}\d/)?.[0]?.trim() ?? text.trim()
}

/** Checks one answer. Empty optional answers (or "skip" in chat) pass as blank. */
export function checkAnswer(field: ContactField, raw: unknown, { chat = false } = {}): { ok: true; value: string } | { ok: false; error: string } {
  const value = typeof raw === 'string' ? raw.trim().slice(0, LIMIT[field.type]) : ''
  const message = chat ? field.retry || FORM_ERROR[field.type] : FORM_ERROR[field.type]
  if (!value || (chat && !field.required && SKIP.test(value))) {
    return field.required ? { ok: false, error: message } : { ok: true, value: '' }
  }
  const fail = { ok: false as const, error: message }
  switch (field.type) {
    case 'name': {
      const name = extractName(value)
      // Only greetings or lead-in words ("hello", "my name is") is not a name yet.
      const filler = /^(hi|hello|hey|hiya|yo|my|name|names|is|i|im|i'm|am|this|it|it's|its|call|me|you|can|the|a|and|thanks|thank|ok|okay|yes|no)$/i
      const empty = name.split(/[\s,.!?]+/).filter(Boolean).every((w) => filler.test(w))
      return empty || name.length < 2 || /\d|@/.test(name) || name.split(/\s+/).length > 5 ? fail : { ok: true, value: name }
    }
    case 'email': {
      const found = value.match(/[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]{2,}/)?.[0]
      return found && EMAIL.test(found) ? { ok: true, value: found } : fail
    }
    case 'phone': {
      const phone = extractPhone(value)
      const digits = phone.replace(/\D/g, '')
      return /^[+()\d\s.-]+$/.test(phone) && digits.length >= 7 && digits.length <= 15 ? { ok: true, value: phone } : fail
    }
    case 'choice': {
      const picked = field.options.length ? matchOption(value, field.options) : value
      return picked ? { ok: true, value: picked } : fail
    }
    case 'textarea':
      return value.length < 10 ? fail : { ok: true, value }
    default:
      return { ok: true, value }
  }
}

/** Fills {first}, {name}, {email} and {answer} in a chat line. */
export function fillIn(template: string, answers: Record<string, string>, fields: ContactField[], answer = ''): string {
  const name = answers[fields.find((f) => f.type === 'name')?.key ?? ''] ?? ''
  const email = answers[fields.find((f) => f.type === 'email')?.key ?? ''] ?? ''
  return template.replaceAll('{first}', name.split(/\s+/)[0] ?? '').replaceAll('{name}', name).replaceAll('{email}', email).replaceAll('{answer}', answer)
}

/** Admin values, checked: unknown types fall back to text, keys made safe, and at least a name, email and message. */
export function toContactSettings(doc: Record<string, unknown> | null | undefined): ContactSettings {
  const d = DEFAULT_CONTACT
  const str = (v: unknown, fallback: string) => (typeof v === 'string' && v.trim() ? v.trim() : fallback)
  const types: FieldType[] = ['name', 'email', 'phone', 'text', 'textarea', 'choice']
  const rows = Array.isArray(doc?.fields) ? (doc.fields as Record<string, unknown>[]) : []
  const seen = new Set<string>()
  const fields = rows
    .map((r): ContactField | null => {
      const key = String(r.key ?? '').toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '')
      if (!key || seen.has(key)) return null
      seen.add(key)
      const type = types.includes(r.type as FieldType) ? (r.type as FieldType) : 'text'
      return {
        key,
        type,
        label: str(r.label, key),
        question: str(r.question, str(r.label, key)),
        required: r.required !== false,
        placeholder: typeof r.placeholder === 'string' ? r.placeholder : undefined,
        options: Array.isArray(r.options) ? (r.options as { label?: unknown }[]).map((o) => String(o.label ?? '').trim()).filter(Boolean) : [],
        retry: typeof r.retry === 'string' && r.retry.trim() ? r.retry.trim() : undefined,
        reply: typeof r.reply === 'string' && r.reply.trim() ? r.reply.trim() : undefined,
      }
    })
    .filter((f): f is ContactField => Boolean(f))
  // A message always needs a way to reply: without a name, email and message field, the defaults are used.
  const usable = fields.some((f) => f.type === 'email' && f.required) && fields.some((f) => f.type === 'name') && fields.some((f) => f.type === 'textarea')
  const mode = doc?.mode === 'chat' || doc?.mode === 'form' ? doc.mode : 'both'
  return {
    heading: str(doc?.heading, d.heading),
    intro: str(doc?.intro, d.intro),
    mode,
    firstMode: doc?.firstMode === 'chat' ? 'chat' : 'form',
    greeting: str(doc?.greeting, d.greeting),
    doneMessage: str(doc?.doneMessage, d.doneMessage),
    formNote: str(doc?.formNote, d.formNote),
    fields: usable ? fields : DEFAULT_FIELDS,
    notify: doc?.notify !== false,
    notifyEmail: typeof doc?.notifyEmail === 'string' && EMAIL.test(doc.notifyEmail.trim()) ? doc.notifyEmail.trim() : undefined,
  }
}
