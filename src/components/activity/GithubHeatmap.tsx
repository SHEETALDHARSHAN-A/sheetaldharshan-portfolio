import { BrandIcon } from '@/components/BrandIcon'
import type { GithubActivity } from '@/data/activity'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const label = (iso: string) => {
  const d = new Date(`${iso}T00:00:00Z`)
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`
}

/** Contribution calendar for the sidebar: the last few weeks as a grid, one square per day. */
export function GithubHeatmap({ data, weeks = 18 }: { data: GithubActivity; weeks?: number }) {
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
  const profile = `https://github.com/${data.profiles[0]}`

  return (
    <section className="activity-card" aria-label="GitHub contributions">
      <a className="activity-head" href={profile} rel="noreferrer" target="_blank">
        <BrandIcon href={profile} size={13} />
        <span className="activity-title">GitHub</span>
        <span className="activity-sub">{data.total.toLocaleString('en')} this year</span>
      </a>
      <div className="gh-months" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }} aria-hidden="true">
        {months.map((m, i) => (
          <span key={i}>{m}</span>
        ))}
      </div>
      <div className="gh-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }} role="img" aria-label={`${recent} contributions in the last ${weeks} weeks`}>
        {Array.from({ length: lead }, (_, i) => (
          <span key={`pad-${i}`} className="gh-pad" />
        ))}
        {days.map((d) => (
          <span key={d.date} data-level={level(d.count)} title={`${d.count === 0 ? 'No' : d.count} contribution${d.count === 1 ? '' : 's'} on ${label(d.date)}`} />
        ))}
      </div>
    </section>
  )
}
