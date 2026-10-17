import type { ReactNode } from 'react'
import type { CodingActivity, Placement } from '@/data/activity'
import { GithubBody } from './GithubBody'
import { LeetcodeBody } from './LeetcodeBody'

/**
 * Every showcase card in one list. To add a platform (CodeChef, Codeforces…): fetch its numbers in
 * src/data/activity.ts, add its settings to the Coding activity global, give it a body component,
 * and add an entry here. The sidebar dock and the About panels pick it up from this list.
 */
export type ActivityCard = {
  id: string
  title: string
  /** Brand name for BrandIcon (src/config/brands.ts). */
  brand: string
  /** The headline number shown next to the title, e.g. "959 this year". */
  summary: string
  show: Placement
  body: (place: 'sidebar' | 'about') => ReactNode
}

export function activityCards(activity: CodingActivity): ActivityCard[] {
  const cards: ActivityCard[] = []
  if (activity.github) {
    const gh = activity.github
    cards.push({ id: 'github', title: 'GitHub', brand: 'GitHub', summary: `${gh.yearTotal.toLocaleString('en')} in ${gh.year}`, show: gh.show, body: (place) => <GithubBody data={gh} weeks={place === 'about' ? 30 : 18} /> })
  }
  if (activity.leetcode) {
    const lc = activity.leetcode
    cards.push({ id: 'leetcode', title: 'LeetCode', brand: 'LeetCode', summary: `${lc.solved.all} solved`, show: lc.show, body: () => <LeetcodeBody data={lc} /> })
  }
  return cards
}
