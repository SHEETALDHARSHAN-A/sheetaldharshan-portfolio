'use client'

export const SIDEBAR_KEY = 'site-sidebar-w'
export const SIDEBAR_MIN = 200
export const SIDEBAR_MAX = 420

const setWidth = (px: number | null) => {
  if (px === null) document.documentElement.style.removeProperty('--sidebar-w')
  else document.documentElement.style.setProperty('--sidebar-w', `${px}px`)
}

/**
 * Drag the sidebar's right edge to make it wider or narrower (double-click resets). The width is
 * remembered in this browser and applied before paint by the head script in the root layout.
 */
export function SidebarResizer() {
  return (
    <span
      className="sidebar-resizer"
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize the sidebar"
      title="Drag to resize · double-click to reset"
      onPointerDown={(e) => {
        if (e.button !== 0) return
        e.preventDefault()
        const handle = e.currentTarget
        const sidebar = handle.parentElement
        if (!sidebar) return
        handle.setPointerCapture(e.pointerId)
        const left = sidebar.getBoundingClientRect().left
        let width = sidebar.getBoundingClientRect().width
        document.documentElement.dataset.resizing = 'true'
        const move = (ev: PointerEvent) => {
          width = Math.round(Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, ev.clientX - left)))
          setWidth(width)
        }
        const up = () => {
          handle.removeEventListener('pointermove', move)
          handle.removeEventListener('pointerup', up)
          handle.removeEventListener('pointercancel', up)
          delete document.documentElement.dataset.resizing
          try {
            window.localStorage.setItem(SIDEBAR_KEY, String(width))
          } catch {
            /* storage blocked: the width lasts for this page only */
          }
        }
        handle.addEventListener('pointermove', move)
        handle.addEventListener('pointerup', up)
        handle.addEventListener('pointercancel', up)
      }}
      onDoubleClick={() => {
        setWidth(null)
        try {
          window.localStorage.removeItem(SIDEBAR_KEY)
        } catch {
          /* storage blocked */
        }
      }}
    />
  )
}
