'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export type WarmImage = { src: string; srcSet?: string; sizes?: string }

const idle = (fn: () => void, timeout: number): (() => void) => {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(fn, { timeout })
    return () => window.cancelIdleCallback(id)
  }
  const id = setTimeout(fn, Math.min(timeout, 1200))
  return () => clearTimeout(id)
}

/**
 * While the homepage conversation plays, quietly gets the rest of the site ready: the pages behind
 * the menu are prefetched and their first images downloaded at low priority, in the same sizes those
 * pages will ask for, so opening Projects or About is instant. Skipped on data-saver connections.
 */
export function SiteWarmup({ routes, images }: { routes: string[]; images: WarmImage[] }) {
  const router = useRouter()
  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
    if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? '')) return
    let cancelled = false
    // Let the first bubbles render and animate before anything else uses the network.
    const cancel = idle(() => {
      for (const href of routes) router.prefetch(href)
      const queue = [...images]
      const next = () => {
        const item = queue.shift()
        if (!item || cancelled) return
        const img = new Image()
        img.decoding = 'async'
        img.fetchPriority = 'low'
        if (item.sizes) img.sizes = item.sizes
        if (item.srcSet) img.srcset = item.srcSet
        img.src = item.src
        // One at a time, so the conversation's own requests never queue behind them.
        img.onload = img.onerror = () => setTimeout(next, 60)
      }
      next()
    }, 2500)
    return () => {
      cancelled = true
      cancel()
    }
  }, [router, routes, images])
  return null
}
