'use client'

import { Moon, Sun } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { cn } from '@/utilities/ui'

type Props = React.ComponentPropsWithoutRef<'button'> & { duration?: number }

const KEY = 'site-theme'

const current = () => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark')

/**
 * Magic UI's Animated Theme Toggler, adapted to this site: the theme is the `data-theme` attribute on
 * <html> (set before paint by the head script in the root layout) and the choice is kept in
 * localStorage. The new theme spreads from the button in a circle; without View Transitions, or with
 * reduced motion, it simply switches.
 */
export function AnimatedThemeToggler({ className, duration = 450, ...props }: Props) {
  const [isDark, setIsDark] = useState(true)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const update = () => setIsDark(current() === 'dark')
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  const toggleTheme = useCallback(async () => {
    const root = document.documentElement
    const next = current() === 'dark' ? 'light' : 'dark'
    const apply = () => {
      flushSync(() => setIsDark(next === 'dark'))
      root.dataset.theme = next
      root.style.colorScheme = next
      try {
        window.localStorage.setItem(KEY, next)
      } catch {
        /* storage blocked: the choice lasts for this page only */
      }
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || root.dataset.motion === 'reduced'
    if (!buttonRef.current || reduced || typeof document.startViewTransition !== 'function') return apply()

    // Everything joins one snapshot for the circle (named view transitions would otherwise fade separately).
    root.classList.add('theme-switching')
    const transition = document.startViewTransition(apply)
    try {
      await transition.ready
      const { top, left, width, height } = buttonRef.current.getBoundingClientRect()
      const x = left + width / 2
      const y = top + height / 2
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' },
      )
      await transition.finished
    } finally {
      root.classList.remove('theme-switching')
    }
  }, [duration])

  return (
    <button ref={buttonRef} type="button" onClick={toggleTheme} className={cn(className)} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} title={isDark ? 'Light mode' : 'Dark mode'} {...props}>
      {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
