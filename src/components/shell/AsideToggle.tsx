'use client'

import { PanelRightClose, PanelRightOpen } from 'lucide-react'
import { useEffect, useState } from 'react'

export const ASIDE_KEY = 'about-aside'

/**
 * About page: hides the right-hand column (photo and coding activity) so the text gets the full width,
 * and brings it back. The choice is kept in this browser and applied before paint by the head script.
 */
export function AsideToggle() {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    setCollapsed(document.documentElement.dataset.aboutAside === 'collapsed')
  }, [])

  const toggle = () => {
    const next = !collapsed
    setCollapsed(next)
    const html = document.documentElement
    if (next) html.dataset.aboutAside = 'collapsed'
    else delete html.dataset.aboutAside
    try {
      window.localStorage.setItem(ASIDE_KEY, next ? 'collapsed' : 'open')
    } catch {
      /* storage blocked: the choice lasts for this page only */
    }
  }

  const label = collapsed ? 'Show photo and activity' : 'Hide photo and activity'
  return (
    <button type="button" className="aside-toggle" onClick={toggle} aria-pressed={collapsed} aria-label={label} title={label}>
      {collapsed ? <PanelRightOpen aria-hidden="true" /> : <PanelRightClose aria-hidden="true" />}
    </button>
  )
}
