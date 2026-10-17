'use client'

import { useRef, useState, type ReactNode } from 'react'

export type DockItem = { id: string; title: string; summary: string; icon: ReactNode; body: ReactNode; defaultOpen: boolean }

const BASE = 30 // px, resting icon size
const MAX = 44 // px, size right under the pointer
const REACH = 70 // px, how far the swell spreads to neighbours

/**
 * Sidebar dock, after Magic UI's Dock: round logos that swell as the pointer nears them (neighbours
 * a little less), like the macOS dock. Clicking one opens its card below; clicking again closes it.
 * One card is open at a time so the pet keeps its space; which one starts open is set in the admin.
 */
export function ActivityDock({ items }: { items: DockItem[] }) {
  const [open, setOpen] = useState<string | null>(items.find((i) => i.defaultOpen)?.id ?? null)
  const row = useRef<HTMLDivElement>(null)
  const raf = useRef(0)
  const current = items.find((i) => i.id === open)

  const swell = (x: number | null) => {
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => {
      row.current?.querySelectorAll<HTMLElement>('.activity-logo').forEach((el) => {
        const r = el.getBoundingClientRect()
        const d = x === null ? REACH : Math.abs(x - (r.left + r.width / 2))
        const size = BASE + (MAX - BASE) * Math.max(0, 1 - d / REACH) ** 2
        el.style.setProperty('--dock-size', `${size.toFixed(1)}px`)
      })
    })
  }

  return (
    <div className="activity-dock">
      <div
        ref={row}
        className="dock-logos"
        role="toolbar"
        aria-label="Coding activity"
        onPointerMove={(e) => e.pointerType === 'mouse' && swell(e.clientX)}
        onPointerLeave={() => swell(null)}
      >
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
