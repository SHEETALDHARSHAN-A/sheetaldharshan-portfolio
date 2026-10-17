import { BrandIcon } from '@/components/BrandIcon'
import type { LeetcodeStats } from '@/data/activity'
import { ActivitySources } from './ActivitySources'
import { TimeAgo } from './TimeAgo'
import { LeetcodeGauge } from './LeetcodeGauge'

/** LeetCode progress, after LeetCode's own profile widget: a gauge plus a tile per difficulty. */
export function LeetcodeCard({ data }: { data: LeetcodeStats }) {
  return (
    <section className="activity-card" aria-label="LeetCode progress">
      <details className="activity-details">
        <summary className="activity-head" title="Where these numbers come from">
          <BrandIcon name="LeetCode" size={13} />
          <span className="activity-title">LeetCode</span>
          <span className="activity-sub">{data.solved.all} solved</span>
          <span className="activity-chev" aria-hidden="true" />
        </summary>
        <ActivitySources sources={data.sources} unit="Problems solved" site="LeetCode" checkedAt={data.checkedAt} />
      </details>
      <LeetcodeGauge data={data} />
      <p className="activity-updated">
        Updated <TimeAgo at={data.checkedAt} />
      </p>
    </section>
  )
}
