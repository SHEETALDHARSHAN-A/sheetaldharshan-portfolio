'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Site-wide page transitions. Internal link clicks first play the current page's exit
 * (cards and text leave first, the big visual follows), then the route changes and the new
 * page plays its entrance (visual first, then cards and text). Exit timings depend on what
 * is on screen; reduced motion, modifier clicks and external links skip the whole thing.
 */
const EXIT_MS: Record<string, number> = { explorer: 900, case: 760, page: 520 }

export function PageTransition({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    delete document.documentElement.dataset.leaving
  }, [pathname])

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const anchor = (event.target as Element | null)?.closest('a')
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return
      const href = anchor.getAttribute('href')
      if (!href || !href.startsWith('/') || href.startsWith('/admin') || href.startsWith('/api') || href.startsWith('//')) return
      if (href === pathname || href.startsWith('#')) return
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'reduced'
      if (reduced || document.documentElement.dataset.leaving) return
      const kind = document.querySelector('.yk') ? 'explorer' : document.querySelector('.case') ? 'case' : 'page'
      event.preventDefault()
      document.documentElement.dataset.leaving = kind
      router.prefetch(href)
      window.setTimeout(() => router.push(href), EXIT_MS[kind])
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [pathname, router])

  return <>{children}</>
}
