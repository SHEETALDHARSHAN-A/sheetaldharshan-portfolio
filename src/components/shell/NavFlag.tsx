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
  }, [pathname])
  return null
}
