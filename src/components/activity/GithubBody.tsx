import type { GithubActivity } from '@/data/activity'
import { ActivityFooter } from './ActivityFooter'
import { HeatmapTooltip } from './HeatmapTooltip'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const ordinal = (n: number) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`

/** The same wording github.com uses: "34 contributions on July 16th." */
const tipText = (iso: string, count: number) => {
  const d = new Date(`${iso}T00:00:00Z`)
  const n = count === 0 ? 'No contributions' : `${count} contribution${count === 1 ? '' : 's'}`
  return `${n} on ${MONTH_NAMES[d.getUTCMonth()]} ${ordinal(d.getUTCDate())}.`
}

/** Contribution calendar: the last few weeks as a grid, one square per day (the card shell adds the header). */
export function GithubBody({ data, weeks = 18 }: { data: GithubActivity; weeks?: number }) {
  const all = data.days
  const lastDay = new Date(`${all[all.length - 1].date}T00:00:00Z`).getUTCDay()
  // Whole weeks (Sunday to Saturday), ending with today's partial week.
  const days = all.slice(Math.max(0, all.length - ((weeks - 1) * 7 + lastDay + 1)))
  const lead = new Date(`${days[0].date}T00:00:00Z`).getUTCDay()
  const max = Math.max(1, ...days.map((d) => d.count))
  const level = (n: number) => (n === 0 ? 0 : Math.min(4, Math.ceil((n / max) * 4)))
  const columns = Math.ceil((lead + days.length) / 7)
  const months = Array.from({ length: columns }, (_, col) => {
    const first = days[Math.max(0, col * 7 - lead)]
    const prev = col > 0 ? days[Math.max(0, (col - 1) * 7 - lead)] : null
    const m = new Date(`${first.date}T00:00:00Z`).getUTCMonth()
    return !prev || new Date(`${prev.date}T00:00:00Z`).getUTCMonth() !== m ? MONTHS[m] : ''
  })
  const recent = days.reduce((n, d) => n + d.count, 0)

  return (
    <div className="activity-body">
      <div className="gh-months" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }} aria-hidden="true">
        {months.map((m, i) => (
          <span key={i}>{m}</span>
        ))}
      </div>
      <HeatmapTooltip>
      <div className="gh-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }} role="img" aria-label={`${recent} contributions in the last ${weeks} weeks`}>
        {Array.from({ length: lead }, (_, i) => (
          <span key={`pad-${i}`} className="gh-pad" />
        ))}
        {days.map((d) => (
          <span key={d.date} data-level={level(d.count)} data-tip={tipText(d.date, d.count)} />
        ))}
      </div>
      </HeatmapTooltip>
      <ActivityFooter checkedAt={data.checkedAt} sources={data.sources} unit="Contributions this year" site="GitHub" />
    </div>
  )
}
