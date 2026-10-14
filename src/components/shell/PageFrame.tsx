import { ViewTransition } from 'react'

const directional = { 'nav-forward': 'nav-forward', 'nav-back': 'nav-back', default: 'none' } as const

/**
 * Wraps a page's content in a directional view transition. Links tagged `nav-forward` slide the
 * old page out to the left while the new one arrives from the right (a page turn); `nav-back`
 * does the opposite. Old and new run at the same time, so the screen is never empty.
 */
export function PageFrame({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition default="none" enter={directional} exit={directional}>
      {children}
    </ViewTransition>
  )
}
