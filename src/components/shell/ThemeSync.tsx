'use client'

import { useEffect } from 'react'

/**
 * Safety net for the head script: re-applies the visitor's saved light/dark choice once React starts,
 * for pages rendered without running it (such as the 404 for an unknown address in development).
 */
export function ThemeSync({ toggle, fallback }: { toggle: boolean; fallback: 'dark' | 'light' | 'system' }) {
  useEffect(() => {
    try {
      const saved = toggle ? window.localStorage.getItem('site-theme') : null
      const mode =
        saved === 'dark' || saved === 'light' ? saved : fallback === 'system' ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : fallback
      const html = document.documentElement
      if (html.dataset.theme !== mode) {
        html.dataset.theme = mode
        html.style.colorScheme = mode
      }
    } catch {
      /* storage blocked: keep the default */
    }
  }, [toggle, fallback])
  return null
}
