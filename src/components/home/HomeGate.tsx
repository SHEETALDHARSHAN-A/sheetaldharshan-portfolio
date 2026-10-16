'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { SEEN_HOME_COOKIE } from './HomeGate.shared'

const hasSeen = () => document.cookie.split('; ').includes(`${SEEN_HOME_COOKIE}=1`)

/**
 * Client half of "the intro plays once per session" (the proxy handles full page loads). Coming
 * back to "/" inside the site, for example with the Back button, hides the homepage before it
 * paints and replaces the entry with /projects, so Back never bounces between the two.
 */
export function HomeGate() {
  const router = useRouter()
  const decision = useRef<'show' | 'skip' | null>(null)

  useLayoutEffect(() => {
    // Decide once per mount; the ref survives React's development double-mount.
    decision.current ??= hasSeen() ? 'skip' : 'show'
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
