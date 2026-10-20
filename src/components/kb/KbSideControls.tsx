'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * The ./stdout side column's controls, the same as the About page's: a divider on its left edge
 * to drag (double-click resets), a grip on it that hides the column, and a tab on the right edge
 * that brings it back. Width and hidden state are kept in this browser and applied before paint.
 */
const W_KEY = 'kb-side-w'
const MIN = 220
const MAX = 400

const setWidth = (px: number | null) => {
  const html = document.documentElement
  if (px === null) html.style.removeProperty('--kb-side-w')
  else html.style.setProperty('--kb-side-w', `${px}px`)
}

export function setKbSide(collapsed: boolean) {
  document.documentElement.dataset.kbSide = collapsed ? 'collapsed' : 'open'
  try {
    localStorage.setItem('kb-side', collapsed ? 'collapsed' : 'open')
  } catch {
    /* storage blocked */
  }
}

export function KbSideResizer() {
  return (
    <div
      className="aside-resizer kb-side-resizer"
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize the channels column"
      title="Drag to resize · double-click to reset"
      onPointerDown={(e) => {
        if (e.button !== 0 || (e.target as HTMLElement).closest('button')) return
        e.preventDefault()
        const handle = e.currentTarget
        const aside = handle.parentElement
        if (!aside) return
        handle.setPointerCapture(e.pointerId)
        const right = aside.getBoundingClientRect().right
        let width = aside.getBoundingClientRect().width
        document.documentElement.dataset.resizing = 'true'
        const move = (ev: PointerEvent) => {
          width = Math.round(Math.min(MAX, Math.max(MIN, right - ev.clientX)))
          setWidth(width)
        }
        const up = () => {
          handle.removeEventListener('pointermove', move)
          handle.removeEventListener('pointerup', up)
          handle.removeEventListener('pointercancel', up)
          delete document.documentElement.dataset.resizing
          try {
            localStorage.setItem(W_KEY, String(width))
          } catch {
            /* storage blocked */
          }
        }
        handle.addEventListener('pointermove', move)
        handle.addEventListener('pointerup', up)
        handle.addEventListener('pointercancel', up)
      }}
      onDoubleClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) return
        setWidth(null)
        try {
          localStorage.removeItem(W_KEY)
        } catch {
          /* storage blocked */
        }
      }}
    >
      <button type="button" className="aside-grip" aria-label="Hide channels and search" title="Hide channels and search" onClick={() => setKbSide(true)}>
        <ChevronRight aria-hidden="true" />
      </button>
    </div>
  )
}

/** While the column is hidden: a tab on the right edge brings it back (drawn at page level, like About's). */
export function KbSideTab() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null
  return createPortal(
    <button type="button" className="aside-toggle kb-side-tab" aria-label="Show channels and search" title="Show channels and search" onClick={() => setKbSide(false)}>
      <ChevronLeft aria-hidden="true" />
    </button>,
    document.body,
  )
}
