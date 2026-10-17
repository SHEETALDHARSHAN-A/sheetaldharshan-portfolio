import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { CodingActivity as CodingActivityDoc } from '@/payload-types'

/* Optional sidebar cards: GitHub contributions and LeetCode progress, from public sources only. */

export type ContributionDay = { date: string; count: number }
/** One account behind a card, with its own number and a link anyone can open to check it. */
export type ActivitySource = { username: string; url: string; value: number }
export type GithubActivity = { days: ContributionDay[]; total: number; sources: ActivitySource[]; checkedAt: number }
export type LeetcodeTotals = { all: number; easy: number; medium: number; hard: number }
export type LeetcodeStats = {
  solved: LeetcodeTotals
  available: LeetcodeTotals
  /** Problems tried but not yet accepted, per difficulty. */
  attempting: LeetcodeTotals
  /** Accepted and total submissions, for the acceptance rate. */
  submissions: { accepted: number; total: number }
  /** "Beats x%" per difficulty, from the account with the most solved (percentiles cannot be added). */
  beats: { easy: number; medium: number; hard: number }
  sources: ActivitySource[]
  checkedAt: number
}
type LeetcodeProfile = Omit<LeetcodeStats, 'sources' | 'checkedAt'> & { checkedAt: number }
/** Where each card is switched on in the admin. */
export type Placement = { sidebar: boolean; about: boolean; sidebarOpen: boolean; aboutOpen: boolean }
export type CodingActivity = { github?: GithubActivity & { show: Placement }; leetcode?: LeetcodeStats & { show: Placement } }

const SIX_HOURS = 6 * 60 * 60

/** Daily counts from a profile's public contribution calendar (the same page github.com renders). */
const githubCalendar = unstable_cache(
  async (username: string): Promise<{ days: ContributionDay[]; checkedAt: number } | null> => {
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
    return days.length ? { days: days.sort((a, b) => a.date.localeCompare(b.date)), checkedAt: Date.now() } : null
  },
  ['github-calendar'],
  { revalidate: SIX_HOURS },
)

type Row = { difficulty: string; count: number; submissions?: number; percentage?: number | null }
type LeetcodeResponse = {
  data?: {
    allQuestionsCount?: Row[]
    matchedUser?: { submitStatsGlobal?: { acSubmissionNum?: Row[]; totalSubmissionNum?: Row[] }; problemsSolvedBeatsStats?: Row[] } | null
  }
}

/** Solved and available counts per difficulty from LeetCode's public GraphQL endpoint. */
const leetcodeProfile = unstable_cache(
  async (username: string): Promise<LeetcodeProfile | null> => {
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Referer: 'https://leetcode.com', 'User-Agent': 'Mozilla/5.0 (sheetaldharshan.me portfolio)' },
      body: JSON.stringify({
        query:
          'query($u:String!){allQuestionsCount{difficulty count} matchedUser(username:$u){submitStatsGlobal{acSubmissionNum{difficulty count submissions} totalSubmissionNum{difficulty count submissions}} problemsSolvedBeatsStats{difficulty percentage}}}',
        variables: { u: username },
      }),
      signal: AbortSignal.timeout(8000),
    }).catch(() => null)
    if (!res?.ok) return null
    const json = (await res.json().catch(() => null)) as LeetcodeResponse | null
    const user = json?.data?.matchedUser
    const ac = user?.submitStatsGlobal?.acSubmissionNum
    const tried = user?.submitStatsGlobal?.totalSubmissionNum ?? []
    if (!ac) return null
    const pick = (rows: Row[] = [], key: 'count' | 'submissions' = 'count'): LeetcodeTotals => {
      const get = (d: string) => rows.find((r) => r.difficulty === d)?.[key] ?? 0
      return { all: get('All'), easy: get('Easy'), medium: get('Medium'), hard: get('Hard') }
    }
    const solved = pick(ac)
    const touched = pick(tried)
    const beat = (d: string) => user?.problemsSolvedBeatsStats?.find((r) => r.difficulty === d)?.percentage ?? 0
    return {
      solved,
      available: pick(json?.data?.allQuestionsCount),
      attempting: {
        all: Math.max(0, touched.all - solved.all),
        easy: Math.max(0, touched.easy - solved.easy),
        medium: Math.max(0, touched.medium - solved.medium),
        hard: Math.max(0, touched.hard - solved.hard),
      },
      submissions: { accepted: pick(ac, 'submissions').all, total: pick(tried, 'submissions').all },
      beats: { easy: beat('Easy'), medium: beat('Medium'), hard: beat('Hard') },
      checkedAt: Date.now(),
    }
  },
  ['leetcode-profile-v2'],
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

  const ghShow: Placement = {
    sidebar: settings.githubInSidebar ?? true,
    about: settings.githubOnAbout ?? true,
    sidebarOpen: settings.githubSidebarOpen ?? false,
    aboutOpen: settings.githubAboutOpen ?? true,
  }
  const lcShow: Placement = {
    sidebar: settings.leetcodeInSidebar ?? false,
    about: settings.leetcodeOnAbout ?? true,
    sidebarOpen: settings.leetcodeSidebarOpen ?? false,
    aboutOpen: settings.leetcodeAboutOpen ?? true,
  }
  const gh = ghShow.sidebar || ghShow.about ? usernames(settings.githubAccounts) : []
  if (gh.length) {
    const loaded = (await Promise.all(gh.map(async (u) => ({ u, cal: await githubCalendar(u).catch(() => null) })))).filter((x) => x.cal)
    if (loaded.length) {
      const byDate = new Map<string, number>()
      for (const { cal } of loaded) for (const d of cal!.days) byDate.set(d.date, (byDate.get(d.date) ?? 0) + d.count)
      const days = [...byDate].map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date))
      result.github = {
        days,
        total: days.reduce((n, d) => n + d.count, 0),
        sources: loaded.map(({ u, cal }) => ({ username: u, url: `https://github.com/${u}`, value: cal!.days.reduce((n, d) => n + d.count, 0) })),
        checkedAt: Math.min(...loaded.map(({ cal }) => cal!.checkedAt)),
        show: ghShow,
      }
    }
  }

  const lc = lcShow.sidebar || lcShow.about ? usernames(settings.leetcodeAccounts) : []
  if (lc.length) {
    const loaded = (await Promise.all(lc.map(async (u) => ({ u, p: await leetcodeProfile(u).catch(() => null) })))).filter((x) => x.p)
    if (loaded.length) {
      const total = (pick: (p: LeetcodeProfile) => LeetcodeTotals): LeetcodeTotals => ({
        all: loaded.reduce((n, { p }) => n + pick(p!).all, 0),
        easy: loaded.reduce((n, { p }) => n + pick(p!).easy, 0),
        medium: loaded.reduce((n, { p }) => n + pick(p!).medium, 0),
        hard: loaded.reduce((n, { p }) => n + pick(p!).hard, 0),
      })
      const top = loaded.reduce((a, b) => (b.p!.solved.all > a.p!.solved.all ? b : a)).p!
      result.leetcode = {
        solved: total((p) => p.solved),
        attempting: total((p) => p.attempting),
        submissions: {
          accepted: loaded.reduce((n, { p }) => n + p!.submissions.accepted, 0),
          total: loaded.reduce((n, { p }) => n + p!.submissions.total, 0),
        },
        beats: top.beats,
        available: loaded[0].p!.available,
        sources: loaded.map(({ u, p }) => ({ username: u, url: `https://leetcode.com/u/${u}/`, value: p!.solved.all })),
        checkedAt: Math.min(...loaded.map(({ p }) => p!.checkedAt)),
        show: lcShow,
      }
    }
  }
  return result
})
