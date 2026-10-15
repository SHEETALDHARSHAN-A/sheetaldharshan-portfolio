'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

/** Marks the document once a client-side navigation has happened, so pages can use shorter entrances than on first load. */
export function NavFlag() {
  const pathname = usePathname()
  const first = useRef<string | null>(null)
  useEffect(() => {
    if (first.current === null) {
      first.current = pathname
      return
    }
    if (pathname !== first.current) document.documentElement.dataset.navigated = '1'
    // The content column is the scroll container; start each page at its top, or at the #section asked for.
    const hash = decodeURIComponent(window.location.hash.slice(1))
    const target = hash ? document.getElementById(hash) : null
    if (target) target.scrollIntoView({ block: 'start' })
    else document.querySelector('.main')?.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}
