'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useLayoutEffect, useRef } from 'react'

/** Session cookie set once the visitor has seen the intro (no expiry: it ends with the browser). */
const SEEN_HOME_COOKIE = 'seen_home'

/** Set after the first homepage render in this document, so later ones are in-site visits. */
let renderedInThisDocument = false

const hasSeen = () => document.cookie.split('; ').includes(`${SEEN_HOME_COOKIE}=1`)

/**
 * The intro plays once per browser session when visitors move around the site: coming back to "/"
 * with the Back button or the wordmark hides the homepage before it paints and replaces the entry
 * with /projects, so Back never bounces between the two. Opening the address directly (typing it,
 * a bookmark, a reload) always shows the conversation.
 */
export function HomeGate() {
  const router = useRouter()
  const decision = useRef<'show' | 'skip' | null>(null)

  useLayoutEffect(() => {
    // Decide once per mount; the ref survives React's development double-mount.
    if (decision.current === null) {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
      const openedDirectly = !renderedInThisDocument && new URL(nav?.name ?? window.location.href).pathname === '/'
      renderedInThisDocument = true
      decision.current = openedDirectly || !hasSeen() ? 'show' : 'skip'
    }
    if (decision.current === 'skip') {
      document.documentElement.dataset.skipHome = '1'
      router.replace('/projects')
      return () => void delete document.documentElement.dataset.skipHome
    }
    // Remember the intro was seen when the visitor leaves it (in-site link, reload or new address).
    const mark = () => {
      document.cookie = `${SEEN_HOME_COOKIE}=1; path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`
    }
    window.addEventListener('pagehide', mark)
    return () => {
      window.removeEventListener('pagehide', mark)
      mark()
    }
  }, [router])

  useEffect(() => {
    // A page restored from the browser's back-forward cache skips both the proxy and React.
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted && hasSeen()) window.location.replace('/projects')
    }
    window.addEventListener('pageshow', onShow)
    return () => window.removeEventListener('pageshow', onShow)
  }, [])

  return null
}
