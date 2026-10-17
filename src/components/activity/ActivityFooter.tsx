import type { ReactNode } from 'react'
import type { ActivitySource } from '@/data/activity'
import { ActivitySources } from './ActivitySources'
import { TimeAgo } from './TimeAgo'

/** "Updated 2 days ago · Sources": when the numbers were fetched, and the public profiles they come from. */
export function ActivityFooter({ checkedAt, sources, unit, site, legend }: { checkedAt: number; sources: ActivitySource[]; unit: string; site: string; legend?: ReactNode }) {
  return (
    <details className="activity-footer">
      <summary>
        <span className="activity-footer-src">Sources</span>
        <span className="activity-footer-time">
          · Updated <TimeAgo at={checkedAt} />
        </span>
        {legend ? <span className="activity-legend">{legend}</span> : null}
      </summary>
      <ActivitySources sources={sources} unit={unit} site={site} checkedAt={checkedAt} />
    </details>
  )
}
