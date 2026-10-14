'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

/** The phone menu: a details element that also closes on outside tap, Escape and route change. */
export function MobileMenu({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    if (ref.current) ref.current.open = false
  }, [pathname])

  useEffect(() => {
    const close = (event: Event) => {
      const el = ref.current
      if (!el?.open) return
      if (event instanceof KeyboardEvent) {
        if (event.key === 'Escape') el.open = false
        return
      }
      if (!el.contains(event.target as Node)) el.open = false
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', close)
    }
  }, [])

  return (
    <details ref={ref}>
      <summary>Menu</summary>
      <nav className="menu" aria-label="Primary">
        {children}
      </nav>
    </details>
  )
}
