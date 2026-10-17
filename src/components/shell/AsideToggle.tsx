'use client'

import { ChevronLeft } from 'lucide-react'
import { collapseAside } from './AsideResizer'

/** While the About page's photo column is hidden: a tab on the right edge that brings it back. */
export function AsideToggle() {
  return (
    <button type="button" className="aside-toggle" aria-label="Show photo and activity" title="Show photo and activity" onClick={() => collapseAside(false)}>
      <ChevronLeft aria-hidden="true" />
    </button>
  )
}
