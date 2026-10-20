/**
 * Checks what visitors write in the ./stdout (comments, reviews, feedback, names) before it is
 * shown. Three outcomes:
 *   - reject: slurs, threats and severe abuse. Never stored; the visitor is asked to rephrase.
 *   - hold:   general swearing, several links, shouting or spam patterns. Stored, but hidden until
 *             approved in the admin.
 *   - publish: everything else.
 * Words are matched after undoing common disguises (f*ck, sh1t, b.i.t.c.h, fuuuck). Hindi and Tamil
 * abuse written in English letters is included. More words can be added in the admin
 * (./stdout → Settings → Blocked words); those are rejected.
 */
export type Verdict = { action: 'publish' | 'hold' | 'reject'; reason?: string }

// Rejected outright. Stems: a word starting with one of these matches (e.g. "faggots").
const SEVERE = [
  'nigger', 'nigga', 'faggot', 'fagot', 'retard', 'tranny', 'chink', 'spic', 'kike', 'paki', 'coon', 'wetback',
  'killyourself', 'kys', 'rapist', 'rape', 'gangbang', 'pedo', 'paedo', 'molest',
  // Hindi / Urdu (romanised)
  'madarchod', 'maderchod', 'madarjat', 'behenchod', 'bhenchod', 'benchod', 'bhosdi', 'bhosad', 'randi', 'chinal', 'gaandu', 'gandu', 'lauda', 'lawda', 'lodu', 'chod',
  // Tamil (romanised)
  'thevidiya', 'thevdiya', 'thevudiya', 'punda', 'pundai', 'koothi', 'oombu', 'baadu', 'otha', 'ommala', 'ootha',
]

// Held for approval: swearing that is rude but not hateful.
const MILD = [
  'fuck', 'fuk', 'fck', 'shit', 'bitch', 'bastard', 'asshole', 'arsehole', 'dick', 'cock', 'pussy', 'cunt', 'whore', 'slut', 'wanker', 'twat', 'bollocks', 'motherfucker', 'mf', 'wtf', 'stfu', 'dumbass', 'jackass', 'douche', 'porn', 'xxx', 'sex',
  'chutiya', 'chutia', 'kutta', 'kutti', 'kamina', 'harami', 'saala', 'bakchod', 'loosu', 'naaye', 'porukki', 'mayiru', 'mairu',
]

// Words that start like a stem but are fine ("cockpit", "dickens", "sextant", "assess", "scunthorpe" style).
const ALLOWED = ['cockpit', 'cocktail', 'cockroach', 'dickens', 'dickinson', 'sextant', 'sexton', 'sussex', 'essex', 'middlesex', 'shiitake', 'chodorow', 'otherwise', 'mfa', 'pakistan', 'spice', 'spicy', 'coonhound', 'raccoon', 'grape', 'drape', 'therapist', 'scrape', 'rapeseed', 'kysely', 'lodukai', 'pundit', 'chode', 'cockatoo', 'cockatiel']

const LEET: Record<string, string> = { '0': 'o', '1': 'i', '!': 'i', '|': 'i', '3': 'e', '4': 'a', '@': 'a', '5': 's', '$': 's', '7': 't', '+': 't', '8': 'b', '9': 'g', '*': 'u' }

/** Lowercase, undo leetspeak and accents, and squeeze runs of the same letter ("fuuuck" → "fuck"). */
function normalise(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[0-9!|@$+*]/g, (c) => LEET[c] ?? c)
    .replace(/([a-z])\1{2,}/g, '$1$1')
}

const words = (text: string) => normalise(text).split(/[^a-z]+/).filter(Boolean)

/** Words split with dots, dashes or spaces between single letters: "f.u.c.k", "b i t c h". */
function joinedSingles(text: string): string[] {
  const runs = normalise(text).match(/(?:\b[a-z][^a-z\n]{1,3}){2,}[a-z]\b/g) ?? []
  return runs.map((r) => r.replace(/[^a-z]/g, ''))
}

function matches(list: string[], text: string, extra: string[] = []): string | undefined {
  const all = [...list, ...extra]
  const candidates = [...words(text), ...joinedSingles(text)]
  const squashed = words(text).join('')
  for (const w of candidates) {
    if (ALLOWED.some((a) => w.startsWith(a))) continue
    const hit = all.find((stem) => (stem.length <= 3 ? w === stem : w.startsWith(stem) || w.replace(/(.)\1/g, '$1').startsWith(stem)))
    if (hit) return hit
  }
  // Phrases written as one, e.g. "kill your self".
  return all.find((stem) => stem.length >= 8 && squashed.includes(stem))
}

export function moderate(text: string, opts: { blocked?: string[]; holdAll?: boolean } = {}): Verdict {
  const t = text.trim()
  const extra = (opts.blocked ?? []).map((w) => normalise(w).replace(/[^a-z]/g, '')).filter((w) => w.length >= 3)
  if (matches(SEVERE, t, extra)) return { action: 'reject', reason: 'abusive language' }
  const links = (t.match(/https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|xyz|ru|cn|top|click|shop)\b/gi) ?? []).length
  if (matches(MILD, t)) return { action: 'hold', reason: 'strong language' }
  if (links >= 2) return { action: 'hold', reason: 'several links' }
  const letters = t.replace(/[^a-zA-Z]/g, '')
  if (letters.length >= 20 && letters.replace(/[^A-Z]/g, '').length / letters.length > 0.7) return { action: 'hold', reason: 'all capitals' }
  if (/(.)\1{9,}/.test(t) || /\b(\w+)\b(?:\W+\1\b){4,}/i.test(t)) return { action: 'hold', reason: 'repeated text' }
  if (/\b(viagra|casino|crypto ?airdrop|forex|loan offer|whatsapp me|telegram me|seo services|backlinks?)\b/i.test(t)) return { action: 'hold', reason: 'looks like spam' }
  if (opts.holdAll) return { action: 'hold', reason: 'every comment is reviewed first' }
  return { action: 'publish' }
}

/** The stricter of two verdicts, e.g. for a name and a comment together. */
export function worst(...verdicts: Verdict[]): Verdict {
  const rank = { publish: 0, hold: 1, reject: 2 }
  return verdicts.reduce((a, b) => (rank[b.action] > rank[a.action] ? b : a), { action: 'publish' } as Verdict)
}

export const REJECT_MESSAGE = "Let's keep it kind: that wording isn't allowed here. Could you rephrase it?"
