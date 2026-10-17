import type { LeetcodeStats } from '@/data/activity'
import { ActivityFooter } from './ActivityFooter'
import { LeetcodeGauge } from './LeetcodeGauge'

/** LeetCode progress after LeetCode's own profile widget (the card shell adds the header). */
export function LeetcodeBody({ data }: { data: LeetcodeStats }) {
  return (
    <div className="activity-body">
      <LeetcodeGauge data={data} />
      <ActivityFooter checkedAt={data.checkedAt} sources={data.sources} unit="Problems solved" site="LeetCode" />
    </div>
  )
}
