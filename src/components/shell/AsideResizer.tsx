'use client'

import { ChevronRight } from 'lucide-react'

export const ASIDE_W_KEY = 'about-aside-w'
const MIN = 240
const MAX = 640

const setWidth = (px: number | null) => {
  const html = document.documentElement
  if (px === null) html.style.removeProperty('--about-aside-w')
  else html.style.setProperty('--about-aside-w', `${px}px`)
}

/** Hides the column (the tab on the right edge brings it back; see AsideToggle). */
export function collapseAside(collapsed: boolean) {
  const html = document.documentElement
  if (collapsed) html.dataset.aboutAside = 'collapsed'
  else delete html.dataset.aboutAside
  try {
    window.localStorage.setItem('about-aside', collapsed ? 'collapsed' : 'open')
  } catch {
    /* storage blocked */
  }
}

/**
 * The divider on the left edge of the About page's photo column: drag it to make the column narrower
 * (more room to read) or wider; double-click resets. Its grip hides the column. The width is kept in
 * this browser and applied before paint by the head script.
 */
export function AsideResizer() {
  return (
    <div
      className="aside-resizer"
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize the photo column"
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
            window.localStorage.setItem(ASIDE_W_KEY, String(width))
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
          window.localStorage.removeItem(ASIDE_W_KEY)
        } catch {
          /* storage blocked */
        }
      }}
    >
      <button type="button" className="aside-grip" aria-label="Hide photo and activity" title="Hide photo and activity" onClick={() => collapseAside(true)}>
        <ChevronRight aria-hidden="true" />
      </button>
    </div>
  )
}
