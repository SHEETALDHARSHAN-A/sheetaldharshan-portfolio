import type MiniSearch from 'minisearch'
import type { SearchDoc, SearchDocType } from '@/data/types'

export type Hit = SearchDoc & { score: number; terms: string[] }
export type Segment = { text: string; hit: boolean }

export const typeLabels: Record<SearchDocType, string> = {
  page: 'Page',
  project: 'Project',
  post: 'Field Notes',
  publication: 'Research',
  experience: 'Experience',
  education: 'Education',
  certification: 'Certificate',
  skill: 'Skills',
  link: 'Link',
}

/* Pages and projects are what people usually mean; nudge them up when scores are close. */
const typeBoost: Record<SearchDocType, number> = {
  page: 1.35,
  project: 1.3,
  post: 1.1,
  publication: 1.05,
  experience: 0.9,
  skill: 0.6,
  education: 0.9,
  certification: 0.85,
  link: 0.9,
}

const STOP = new Set(['a', 'an', 'and', 'are', 'at', 'be', 'by', 'do', 'for', 'from', 'how', 'i', 'in', 'is', 'it', 'me', 'my', 'of', 'on', 'or', 'show', 'take', 'the', 'to', 'what', 'where', 'with', 'you', 'your', 'go', 'open', 'find', 'see'])

/* Everyday words mapped to what this site calls things. */
const SYNONYMS: Record<string, string> = {
  blog: 'writing',
  article: 'writing',
  articles: 'writing',
  post: 'writing',
  posts: 'writing',
  cv: 'resume',
  hire: 'contact',
  email: 'contact',
  mail: 'contact',
  paper: 'publications',
  papers: 'publications',
  work: 'projects',
  skill: 'skills',
  stack: 'skills',
  job: 'experience',
  jobs: 'experience',
}

export const normalize = (text: string) => text.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
const tokenize = (text: string) => text.split(/[^\p{L}\p{N}#+]+/u).filter(Boolean)

export type Engine = { search: (query: string, limit?: number) => Hit[]; suggest: (query: string) => string | undefined; docs: SearchDoc[] }

let loading: Promise<Engine> | null = null

/** Loads the search library and the index once; safe to call early (on hover) to warm it up. */
export function loadEngine(): Promise<Engine> {
  loading ??= Promise.all([import('minisearch'), fetch('/search-index.json').then((r) => (r.ok ? r.json() : { docs: [] }))])
    .then(([mod, data]: [{ default: typeof MiniSearch }, { docs: SearchDoc[] }]) => createEngine(mod.default, data.docs ?? []))
    .catch((error) => {
      loading = null
      throw error
    })
  return loading
}

function createEngine(MiniSearchImpl: typeof MiniSearch, docs: SearchDoc[]): Engine {
  const index = new MiniSearchImpl<SearchDoc>({
    fields: ['title', 'keywords', 'tags', 'subtitle', 'body'],
    storeFields: ['id', 'type', 'title', 'subtitle', 'href', 'external', 'body', 'featured'],
    tokenize,
    processTerm: (term) => {
      const t = normalize(term)
      return t && !STOP.has(t) ? t : null
    },
    searchOptions: {
      boost: { title: 6, keywords: 3, tags: 3, subtitle: 1.5, body: 1 },
      prefix: true,
      // Typo tolerance grows with the word: none for short words, up to two edits for long ones.
      fuzzy: (term) => (term.length < 4 ? false : term.length < 7 ? 1 : 2),
      maxFuzzy: 2,
      weights: { fuzzy: 0.4, prefix: 0.7 },
    },
  })
  index.addAll(docs)

  const run = (words: string[], combineWith: 'AND' | 'OR') =>
    index.search(
      {
        combineWith,
        // A word with a synonym matches either form ("blog" finds Writing), without requiring both.
        queries: words.map((w) => (SYNONYMS[w] ? { combineWith: 'OR' as const, queries: [w, SYNONYMS[w]] } : w)),
      },
      { boostDocument: (_id, _term, stored) => typeBoost[(stored?.type as SearchDocType) ?? 'page'] * (stored?.featured ? 1.1 : 1) },
    )

  const search = (query: string, limit = 8): Hit[] => {
    const q = query.trim()
    const words = tokenize(normalize(q)).filter((w) => !STOP.has(w))
    if (!words.length) return []
    let results = run(words, 'AND')
    // Every word has to match first; if nothing does, fall back to the best partial matches.
    if (!results.length) results = run(words, 'OR')
    const nq = normalize(q)
    return results
      .map((r) => {
        const title = normalize(String(r.title))
        // A title that starts with or contains the whole query is almost always the one.
        const bonus = title === nq ? 3 : title.startsWith(nq) ? 2 : title.includes(nq) ? 1.5 : 1
        return { ...(r as unknown as SearchDoc), score: r.score * bonus, terms: r.terms }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  const suggest = (query: string) => {
    const words = tokenize(normalize(query)).filter((w) => !STOP.has(w))
    if (!words.length) return undefined
    const best = index.autoSuggest(words.join(' '), { fuzzy: 0.34, prefix: true, combineWith: 'OR' })[0]?.suggestion
    return best && best !== words.join(' ') ? best : undefined
  }

  return { search, suggest, docs }
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Splits text into plain and highlighted runs for the matched index terms (whole words, any case). */
export function highlight(text: string, terms: string[]): Segment[] {
  if (!text || !terms.length) return [{ text, hit: false }]
  const re = new RegExp(`(?<![\\p{L}\\p{N}])(${terms.map(escapeRe).sort((a, b) => b.length - a.length).join('|')})[\\p{L}\\p{N}]*`, 'giu')
  const folded = normalize(text)
  // Match on the accent-folded copy so "résumé" matches "resume"; NFKD folding keeps lengths for Latin text.
  const source = folded.length === text.length ? folded : text
  const out: Segment[] = []
  let last = 0
  for (const m of source.matchAll(re)) {
    const start = m.index ?? 0
    if (start > last) out.push({ text: text.slice(last, start), hit: false })
    out.push({ text: text.slice(start, start + m[0].length), hit: true })
    last = start + m[0].length
  }
  if (last < text.length) out.push({ text: text.slice(last), hit: false })
  return out
}

/** A short window of the body around the first match, so the reason for a hit is visible. */
export function snippet(text: string | undefined, terms: string[], width = 120): string | undefined {
  if (!text) return undefined
  const folded = normalize(text)
  let at = -1
  for (const term of terms) {
    const i = folded.search(new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(term)}`, 'u'))
    if (i >= 0 && (at < 0 || i < at)) at = i
  }
  if (at < 0) return text.length > width ? `${text.slice(0, width).trimEnd()}…` : text
  const start = Math.max(0, at - Math.floor(width / 3))
  const end = Math.min(text.length, start + width)
  return `${start > 0 ? '…' : ''}${text.slice(start, end).trim()}${end < text.length ? '…' : ''}`
}
