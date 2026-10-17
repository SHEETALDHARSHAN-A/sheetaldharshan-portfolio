import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { CodingActivity as CodingActivityDoc } from '@/payload-types'

/* Optional sidebar cards: GitHub contributions and LeetCode progress, from public sources only. */

export type ContributionDay = { date: string; count: number }
export type GithubActivity = { days: ContributionDay[]; total: number; profiles: string[] }
export type LeetcodeTotals = { all: number; easy: number; medium: number; hard: number }
export type LeetcodeStats = { solved: LeetcodeTotals; available: LeetcodeTotals; profiles: string[] }
export type CodingActivity = { github?: GithubActivity; leetcode?: LeetcodeStats }

const SIX_HOURS = 6 * 60 * 60

/** Daily counts from a profile's public contribution calendar (the same page github.com renders). */
const githubCalendar = unstable_cache(
  async (username: string): Promise<ContributionDay[] | null> => {
    const res = await fetch(`https://github.com/users/${encodeURIComponent(username)}/contributions`, {
      headers: { 'User-Agent': 'sheetaldharshan.me portfolio' },
      signal: AbortSignal.timeout(8000),
    }).catch(() => null)
    if (!res?.ok) return null
    const html = await res.text()
    const tips = new Map<string, number>()
    for (const m of html.matchAll(/<tool-tip[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
      const n = /^(\d[\d,]*)\s+contribution/.exec(m[2].trim())
      tips.set(m[1], n ? Number(n[1].replace(/,/g, '')) : 0)
    }
    const days: ContributionDay[] = []
    for (const m of html.matchAll(/<td\b[^>]*>/g)) {
      const date = /\bdata-date="(\d{4}-\d{2}-\d{2})"/.exec(m[0])?.[1]
      const id = /\bid="([^"]+)"/.exec(m[0])?.[1]
      if (date && id) days.push({ date, count: tips.get(id) ?? 0 })
    }
    return days.length ? days.sort((a, b) => a.date.localeCompare(b.date)) : null
  },
  ['github-calendar'],
  { revalidate: SIX_HOURS },
)

type LeetcodeResponse = {
  data?: {
    allQuestionsCount?: { difficulty: string; count: number }[]
    matchedUser?: { submitStatsGlobal?: { acSubmissionNum?: { difficulty: string; count: number }[] } } | null
  }
}

/** Solved and available counts per difficulty from LeetCode's public GraphQL endpoint. */
const leetcodeProfile = unstable_cache(
  async (username: string): Promise<{ solved: LeetcodeTotals; available: LeetcodeTotals } | null> => {
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Referer: 'https://leetcode.com', 'User-Agent': 'Mozilla/5.0 (sheetaldharshan.me portfolio)' },
      body: JSON.stringify({
        query: 'query($u:String!){allQuestionsCount{difficulty count} matchedUser(username:$u){submitStatsGlobal{acSubmissionNum{difficulty count}}}}',
        variables: { u: username },
      }),
      signal: AbortSignal.timeout(8000),
    }).catch(() => null)
    if (!res?.ok) return null
    const json = (await res.json().catch(() => null)) as LeetcodeResponse | null
    const solvedRows = json?.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum
    if (!solvedRows) return null
    const pick = (rows: { difficulty: string; count: number }[] = []): LeetcodeTotals => {
      const get = (d: string) => rows.find((r) => r.difficulty === d)?.count ?? 0
      return { all: get('All'), easy: get('Easy'), medium: get('Medium'), hard: get('Hard') }
    }
    return { solved: pick(solvedRows), available: pick(json?.data?.allQuestionsCount) }
  },
  ['leetcode-profile'],
  { revalidate: SIX_HOURS },
)

const usernames = (rows?: { username: string; enabled?: boolean | null }[] | null) =>
  (rows ?? []).filter((r) => r.enabled !== false && r.username?.trim()).map((r) => r.username.trim())

/** The enabled cards with every included account added together. A card that cannot load is left out. */
export const getCodingActivity = cache(async (): Promise<CodingActivity> => {
  const payload = await getPayload({ config: configPromise })
  const settings = (await payload.findGlobal({ slug: 'coding-activity', depth: 0 }).catch(() => null)) as CodingActivityDoc | null
  if (!settings) return {}
  const result: CodingActivity = {}

  const gh = settings.githubEnabled ? usernames(settings.githubAccounts) : []
  if (gh.length) {
    const calendars = (await Promise.all(gh.map((u) => githubCalendar(u).catch(() => null)))).filter((c): c is ContributionDay[] => Boolean(c))
    if (calendars.length) {
      const byDate = new Map<string, number>()
      for (const cal of calendars) for (const d of cal) byDate.set(d.date, (byDate.get(d.date) ?? 0) + d.count)
      const days = [...byDate].map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date))
      result.github = { days, total: days.reduce((n, d) => n + d.count, 0), profiles: gh }
    }
  }

  const lc = settings.leetcodeEnabled ? usernames(settings.leetcodeAccounts) : []
  if (lc.length) {
    const profiles = (await Promise.all(lc.map((u) => leetcodeProfile(u).catch(() => null)))).filter((p): p is NonNullable<typeof p> => Boolean(p))
    if (profiles.length) {
      const sum = (key: keyof LeetcodeTotals) => profiles.reduce((n, p) => n + p.solved[key], 0)
      result.leetcode = {
        solved: { all: sum('all'), easy: sum('easy'), medium: sum('medium'), hard: sum('hard') },
        available: profiles[0].available,
        profiles: lc,
      }
    }
  }
  return result
})
