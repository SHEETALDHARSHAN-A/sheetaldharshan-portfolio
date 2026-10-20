'use client'

import { useStars } from './stars'

export function StarIcon({ on, size = 16 }: { on: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="m12 3.2 2.7 5.5 6 .9-4.35 4.25 1.03 6-5.38-2.83-5.38 2.83 1.03-6L3.3 9.6l6-.9z" />
    </svg>
  )
}

/** Star a channel: it moves to Starred in the sidebar, on this browser. */
export function StarButton({ id, title }: { id: string; title: string }) {
  const { counts, mine, toggle } = useStars()
  const on = mine.includes(id)
  return (
    <button type="button" className="kb-star" aria-pressed={on} onClick={() => void toggle(id)} title={on ? `Unstar #${title}` : `Star #${title}`}>
      <StarIcon on={on} />
      <span>{on ? 'Starred' : 'Star'}</span>
      {counts[id] ? <b>{counts[id]}</b> : null}
    </button>
  )
}
