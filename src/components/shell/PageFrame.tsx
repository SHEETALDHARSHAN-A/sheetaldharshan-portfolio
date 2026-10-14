import { ViewTransition } from 'react'

const entering = { 'nav-forward': 'nav-forward-in', 'nav-back': 'nav-back-in', default: 'none' } as const
const leaving = { 'nav-forward': 'nav-forward-out', 'nav-back': 'nav-back-out', default: 'none' } as const

/**
 * Wraps a page's content in a directional view transition. Links tagged `nav-forward` slide the
 * old page out to the left while the new one arrives from the right (a page turn); `nav-back`
 * does the opposite. Old and new run at the same time, so the screen is never empty.
 */
export function PageFrame({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition default="none" enter={entering} exit={leaving}>
      {children}
    </ViewTransition>
  )
}
