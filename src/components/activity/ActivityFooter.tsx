import type { ActivitySource } from '@/data/activity'
import { ActivitySources } from './ActivitySources'
import { TimeAgo } from './TimeAgo'

/** "Updated 2 days ago · Sources": when the numbers were fetched, and the public profiles they come from. */
export function ActivityFooter({ checkedAt, sources, unit, site }: { checkedAt: number; sources: ActivitySource[]; unit: string; site: string }) {
  return (
    <details className="activity-footer">
      <summary>
        <span>
          Updated <TimeAgo at={checkedAt} />
        </span>
        <span className="activity-footer-src">Sources</span>
      </summary>
      <ActivitySources sources={sources} unit={unit} site={site} checkedAt={checkedAt} />
    </details>
  )
}
