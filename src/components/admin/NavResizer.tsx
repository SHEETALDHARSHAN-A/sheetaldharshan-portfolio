'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const KEY = 'admin:nav-width'
const SCROLL_KEY = 'admin:nav-scroll'
const MIN = 220
const MAX = 560

const apply = (width: number) => {
  let tag = document.getElementById('admin-nav-width') as HTMLStyleElement | null
  if (!tag) {
    tag = document.createElement('style')
    tag.id = 'admin-nav-width'
    document.head.appendChild(tag)
  }
  // Desktop only: on phones the admin menu covers the screen.
  tag.textContent = `@media (min-width: 769px) { :root { --nav-width: ${width}px; } }`
}

/**
 * The admin menu's memory: a drag handle on its right edge to resize it (double-click resets; the
 * width is remembered in this browser), and its scroll position kept from page to page.
 */
export function NavResizer() {
  const [nav, setNav] = useState<HTMLElement | null>(null)

  useEffect(() => {
    try {
      const saved = Number(window.localStorage.getItem(KEY))
      if (saved >= MIN && saved <= MAX) apply(saved)
    } catch {
      /* storage blocked */
    }
    setNav(document.querySelector<HTMLElement>('aside.nav, .nav'))
  }, [])

  // The admin rebuilds the menu on every page, which would scroll it back to the top: keep its place.
  useEffect(() => {
    const scroller = nav?.querySelector<HTMLElement>('.nav__scroll')
    if (!scroller) return
    try {
      const saved = Number(window.sessionStorage.getItem(SCROLL_KEY))
      if (saved > 0) scroller.scrollTop = saved
    } catch {
      /* storage blocked */
    }
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        try {
          window.sessionStorage.setItem(SCROLL_KEY, String(scroller.scrollTop))
        } catch {
          /* storage blocked */
        }
      })
    }
    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      scroller.removeEventListener('scroll', onScroll)
    }
  }, [nav])

  if (!nav) return null
  return createPortal(
    <span
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize the menu"
      title="Drag to resize · double-click to reset"
      onPointerDown={(e) => {
        e.preventDefault()
        const target = e.currentTarget
        target.setPointerCapture(e.pointerId)
        const left = nav.getBoundingClientRect().left
        document.body.style.cursor = 'col-resize'
        document.body.style.userSelect = 'none'
        let width = nav.getBoundingClientRect().width
        const move = (ev: PointerEvent) => {
          width = Math.round(Math.min(MAX, Math.max(MIN, ev.clientX - left)))
          apply(width)
        }
        const up = () => {
          target.removeEventListener('pointermove', move)
          target.removeEventListener('pointerup', up)
          document.body.style.cursor = ''
          document.body.style.userSelect = ''
          try {
            window.localStorage.setItem(KEY, String(width))
          } catch {
            /* storage blocked */
          }
        }
        target.addEventListener('pointermove', move)
        target.addEventListener('pointerup', up)
      }}
      onDoubleClick={() => {
        document.getElementById('admin-nav-width')?.remove()
        try {
          window.localStorage.removeItem(KEY)
        } catch {
          /* storage blocked */
        }
      }}
      className="admin-nav-resizer"
    >
      <style>{`
        .admin-nav-resizer { position: absolute; top: 0; right: 0; bottom: 0; width: 8px; z-index: 5; cursor: col-resize; touch-action: none; }
        .admin-nav-resizer::after { content: ''; position: absolute; top: 0; bottom: 0; right: 0; width: 2px; background: transparent; transition: background 120ms ease; }
        .admin-nav-resizer:hover::after, .admin-nav-resizer:active::after { background: var(--theme-success-500); }
        @media (max-width: 768px) { .admin-nav-resizer { display: none; } }
      `}</style>
    </span>,
    nav,
  )
}
