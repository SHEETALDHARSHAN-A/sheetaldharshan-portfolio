'use client'

import { ChevronLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { collapseAside } from './AsideResizer'

/**
 * While the About page's photo column is hidden: a tab on the right edge of the content that brings it
 * back. Drawn at page level, since the page's entrance animation leaves a transform that would
 * otherwise pin "fixed" to the content block instead of the screen.
 */
export function AsideToggle() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null
  return createPortal(
    <button type="button" className="aside-toggle" aria-label="Show photo and activity" title="Show photo and activity" onClick={() => collapseAside(false)}>
      <ChevronLeft aria-hidden="true" />
    </button>,
    document.body,
  )
}
