'use client'

import { useLayoutEffect, useRef, useState } from 'react'

/**
 * GitHub-style tooltip for the heatmap: hovering (or tapping) a day shows "34 contributions on
 * July 16th." in a dark pill above it. The pill shifts to stay inside the window; its arrow keeps
 * pointing at the day.
 */
export function HeatmapTooltip({ children }: { children: React.ReactNode }) {
  const [tip, setTip] = useState<{ text: string; x: number; y: number } | null>(null)
  const pill = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const el = pill.current
    if (!el || !tip) return
    const half = el.offsetWidth / 2
    const left = Math.min(Math.max(tip.x, half + 8), window.innerWidth - half - 8)
    el.style.left = `${left}px`
    el.style.setProperty('--arrow', `${tip.x - left}px`)
  }, [tip])

  const show = (target: EventTarget | null) => {
    const cell = (target as HTMLElement | null)?.closest?.('[data-tip]') as HTMLElement | null
    if (!cell) return setTip(null)
    const r = cell.getBoundingClientRect()
    setTip({ text: cell.dataset.tip ?? '', x: r.left + r.width / 2, y: r.top })
  }

  return (
    <div className="gh-tip-host" onPointerOver={(e) => show(e.target)} onPointerLeave={() => setTip(null)} onPointerDown={(e) => show(e.target)}>
      {children}
      {tip ? (
        <span ref={pill} className="gh-tip" role="tooltip" style={{ left: tip.x, top: tip.y }}>
          {tip.text}
        </span>
      ) : null}
    </div>
  )
}
