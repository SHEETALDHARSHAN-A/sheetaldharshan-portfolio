import { BrandIcon } from '@/components/BrandIcon'
import type { ActivityCard } from './cards'

/** About page: each card is a collapsible panel; whether it starts open is set in the admin. */
export function ActivityPanels({ cards }: { cards: ActivityCard[] }) {
  const shown = cards.filter((c) => c.show.about)
  if (!shown.length) return null
  return (
    <div className="activity-panels">
      {shown.map((c) => (
        <details key={c.id} className="activity-panel" open={c.show.aboutOpen} data-card={c.id}>
          <summary className="activity-panel-head">
            <span className="activity-logo" aria-hidden="true">
              <BrandIcon name={c.brand} size={16} />
            </span>
            <span className="activity-title">{c.title}</span>
            <span className="activity-sub">{c.summary}</span>
            <span className="activity-chev" aria-hidden="true" />
          </summary>
          {c.body('about')}
        </details>
      ))}
    </div>
  )
}
