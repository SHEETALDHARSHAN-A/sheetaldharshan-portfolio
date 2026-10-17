'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

export type DockItem = { id: string; title: string; summary: string; icon: ReactNode; body: ReactNode; defaultOpen: boolean }

/**
 * Sidebar dock: overlapping round logos like Magic UI's AvatarCircles. With two or more, hovering the
 * stack spreads them apart so every logo shows in full. Clicking one opens its card below; clicking
 * again closes it. The card floats up above the logos, over the avatar, so opening it never moves
 * anything in the sidebar; clicking elsewhere or Escape closes it.
 * One card is open at a time so the pet keeps its space; which one starts open is set in the admin.
 */
export function ActivityDock({ items }: { items: DockItem[] }) {
  const [open, setOpen] = useState<string | null>(items.find((i) => i.defaultOpen)?.id ?? null)
  const current = items.find((i) => i.id === open)
  const root = useRef<HTMLDivElement>(null)

  // The card opens where the pet stands, so the pet moves up above it while it is open (see Pet.tsx).
  useEffect(() => {
    document.documentElement.toggleAttribute('data-dock-open', Boolean(open))
    return () => document.documentElement.removeAttribute('data-dock-open')
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(null)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="activity-dock" ref={root}>
      <div className="dock-row">
      <div className="dock-logos" role="toolbar" aria-label="Coding activity" data-stacked={items.length > 1 ? 'true' : undefined}>
        {items.map((i) => (
          <button
            key={i.id}
            type="button"
            className="activity-logo"
            aria-expanded={open === i.id}
            aria-controls={`dock-${i.id}`}
            title={`${i.title} · ${i.summary}`}
            onClick={() => setOpen((o) => (o === i.id ? null : i.id))}
          >
            {i.icon}
            <span className="sr-only">{i.title}</span>
          </button>
        ))}
      </div>
        {!current ? <span className="dock-hint">Coding activity</span> : null}
      </div>
      <div className="dock-cards" data-open={current ? 'true' : 'false'}>
        {items.map((i) => (
          <div key={i.id} className="dock-card" id={`dock-${i.id}`} data-open={open === i.id ? 'true' : 'false'} aria-hidden={open !== i.id} inert={open !== i.id}>
            <p className="dock-head">
              <span className="activity-title">{i.title}</span>
              <span className="activity-sub">{i.summary}</span>
            </p>
            {i.body}
          </div>
        ))}
      </div>
    </div>
  )
}
