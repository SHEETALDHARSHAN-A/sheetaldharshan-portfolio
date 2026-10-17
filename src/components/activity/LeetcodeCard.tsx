import { BrandIcon } from '@/components/BrandIcon'
import type { LeetcodeStats } from '@/data/activity'
import { ActivitySources } from './ActivitySources'

const LEVELS = [
  { key: 'easy', label: 'Easy', color: '#00b8a3' },
  { key: 'medium', label: 'Med', color: '#ffc01e' },
  { key: 'hard', label: 'Hard', color: '#ef4743' },
] as const

/** LeetCode progress for the sidebar: solved split by difficulty around a ring, and a bar per level. */
export function LeetcodeCard({ data }: { data: LeetcodeStats }) {
  const { solved, available } = data
  const r = 20
  const c = 2 * Math.PI * r
  let offset = 0
  const arcs = LEVELS.map((l) => {
    const share = solved.all ? solved[l.key] / solved.all : 0
    const arc = { color: l.color, length: Math.max(0, share * c - (share > 0 ? 2 : 0)), offset }
    offset += share * c
    return arc
  })

  return (
    <section className="activity-card" aria-label="LeetCode progress">
      <details className="activity-details">
        <summary className="activity-head" title="Where these numbers come from">
          <BrandIcon name="LeetCode" size={13} />
          <span className="activity-title">LeetCode</span>
          <span className="activity-sub">{solved.all} solved</span>
          <span className="activity-chev" aria-hidden="true" />
        </summary>
        <ActivitySources sources={data.sources} unit="Problems solved" site="LeetCode" checkedAt={data.checkedAt} />
      </details>
      <div className="lc-body">
        <svg className="lc-ring" viewBox="0 0 48 48" role="img" aria-label={`${solved.all} of ${available.all} problems solved`}>
          <circle cx="24" cy="24" r={r} fill="none" stroke="var(--surface)" strokeWidth="4" />
          {arcs.map((a, i) =>
            a.length > 0 ? (
              <circle key={i} cx="24" cy="24" r={r} fill="none" stroke={a.color} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${a.length} ${c}`} strokeDashoffset={-a.offset} transform="rotate(-90 24 24)" />
            ) : null,
          )}
          <text x="24" y="27.5" textAnchor="middle" className="lc-ring-num">
            {solved.all}
          </text>
        </svg>
        <ul className="lc-bars">
          {LEVELS.map((l) => (
            <li key={l.key}>
              <span className="lc-label" style={{ color: l.color }}>
                {l.label}
              </span>
              <span className="lc-count">
                {solved[l.key]}
                <small>/{available[l.key]}</small>
              </span>
              <span className="lc-track">
                <i style={{ width: `${available[l.key] ? Math.max(2, (solved[l.key] / available[l.key]) * 100) : 0}%`, background: l.color }} />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
