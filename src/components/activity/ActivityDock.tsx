'use client'

import { useState, type ReactNode } from 'react'

export type DockItem = { id: string; title: string; summary: string; icon: ReactNode; body: ReactNode; defaultOpen: boolean }

/**
 * Sidebar: a row of round logos. Clicking one opens its card below; clicking it again closes it.
 * One card is open at a time so the pet keeps its space; which one starts open is set in the admin.
 */
export function ActivityDock({ items }: { items: DockItem[] }) {
  const [open, setOpen] = useState<string | null>(items.find((i) => i.defaultOpen)?.id ?? null)
  const current = items.find((i) => i.id === open)
  return (
    <div className="activity-dock">
      <div className="dock-logos" role="toolbar" aria-label="Coding activity">
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
        {!current ? <span className="dock-hint">Coding activity</span> : null}
      </div>
      {current ? (
        <div className="dock-card" id={`dock-${current.id}`} key={current.id}>
          <p className="dock-head">
            <span className="activity-title">{current.title}</span>
            <span className="activity-sub">{current.summary}</span>
          </p>
          {current.body}
        </div>
      ) : null}
    </div>
  )
}
