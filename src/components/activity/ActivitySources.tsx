import { BrandIcon } from '@/components/BrandIcon'
import type { ActivitySource } from '@/data/activity'
import { TimeAgo } from './TimeAgo'

/** The accounts behind a card, each linking to its public profile, so the numbers can be checked. */
export function ActivitySources({ sources, unit, site, checkedAt }: { sources: ActivitySource[]; unit: string; site: string; checkedAt: number }) {
  return (
    <div className="activity-sources">
      <p>
        {unit} from {sources.length > 1 ? 'these public profiles' : 'this public profile'} on {site}, checked <TimeAgo at={checkedAt} />.
      </p>
      <ul>
        {sources.map((s) => (
          <li key={s.url}>
            <a href={s.url} rel="noreferrer" target="_blank" title={`Open ${s.url}`}>
              <BrandIcon href={s.url} size={11} />
              <span className="src-name">{s.username}</span>
            </a>
            <span className="src-value">{s.value.toLocaleString('en')}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
