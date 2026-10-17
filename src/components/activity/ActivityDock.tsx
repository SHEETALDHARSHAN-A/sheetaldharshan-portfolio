'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

export type DockItem = { id: string; title: string; summary: string; icon: ReactNode; body: ReactNode; defaultOpen: boolean }

const ROTATE_MS = 5000

/**
 * Coding-activity dock: overlapping round logos like Magic UI's AvatarCircles, with the cards above
 * them. In the sidebar the cards pop up over the avatar without moving anything (the pet steps up
 * above them); on the About page ("inline") they sit in the page above the logos.
 *
 * Hovering a logo keeps it exactly where it is and slides the others away so each shows in full.
 *
 * - With two or more cards open by default (set in the admin), the pop-up is a carousel: it slides
 *   through them on its own, can be scrolled or swiped, and pauses while hovered or held.
 * - Clicking a logo pins its card. Clicking the same logo again, clicking outside or Escape releases
 *   it, back to the default view (the carousel, the one default card, or closed).
 */
export function ActivityDock({ items, variant = 'sidebar' }: { items: DockItem[]; variant?: 'sidebar' | 'inline' }) {
  const defaults = items.filter((i) => i.defaultOpen)
  const [pinned, setPinned] = useState<string | null>(null)
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hovered, setHovered] = useState<number | null>(null)
  const root = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)

  // What the pop-up shows: the pinned card, or the default ones (a carousel when there are several).
  const shown = pinned ? items.filter((i) => i.id === pinned) : defaults
  const carousel = shown.length > 1
  const visibleId = shown[Math.min(active, shown.length - 1)]?.id ?? null

  const release = useCallback(() => {
    setPinned(null)
    setActive(0)
  }, [])

  // In the sidebar the pet moves up above the card while one shows (Pet.tsx watches this attribute).
  useEffect(() => {
    if (variant !== 'sidebar') return
    const html = document.documentElement
    if (visibleId) html.setAttribute('data-dock-open', visibleId)
    else html.removeAttribute('data-dock-open')
  }, [visibleId, variant])
  useEffect(() => () => {
    if (variant === 'sidebar') document.documentElement.removeAttribute('data-dock-open')
  }, [variant])

  // The pop-up takes the height of the card in view.
  useEffect(() => {
    const el = track.current
    const card = el?.querySelector<HTMLElement>(`[data-card="${visibleId}"]`)
    if (el && card) el.style.height = `${card.offsetHeight}px`
  }, [visibleId, shown.length])

  // Releasing a pinned card: clicking elsewhere or Escape.
  useEffect(() => {
    if (!pinned) return
    const onDown = (e: PointerEvent) => !root.current?.contains(e.target as Node) && release()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && release()
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [pinned, release])

  // The carousel moves on by itself unless hovered, held, focused, hidden, or motion is reduced.
  useEffect(() => {
    if (!carousel || paused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return
      const el = track.current
      if (!el) return
      const next = (Math.round(el.scrollLeft / el.clientWidth) + 1) % shown.length
      el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' })
    }, ROTATE_MS)
    return () => window.clearInterval(t)
  }, [carousel, paused, shown.length])

  const onScroll = () => {
    const el = track.current
    if (el && el.clientWidth) setActive(Math.round(el.scrollLeft / el.clientWidth))
  }

  const goTo = (index: number) => {
    const el = track.current
    if (el) el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' })
  }

  const logos = (
    <div className="dock-row">
      <div
        className="dock-logos"
        role="toolbar"
        aria-label="Coding activity"
        data-stacked={items.length > 1 ? 'true' : undefined}
        data-spread={hovered !== null ? 'true' : undefined}
        style={{ '--h': hovered ?? 0 } as React.CSSProperties}
        onPointerLeave={() => setHovered(null)}
        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setHovered(null)}
      >
        {items.map((i, n) => (
          <button
            key={i.id}
            type="button"
            className="activity-logo"
            style={{ '--i': n } as React.CSSProperties}
            // Mouse only: on touch a tap pins the card, nothing needs to spread.
            onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(n)}
            onFocus={() => setHovered(n)}
            aria-pressed={pinned === i.id}
            aria-expanded={visibleId === i.id}
            aria-controls={`dock-${i.id}`}
            title={pinned === i.id ? `${i.title}: click again to release` : `${i.title} · ${i.summary}`}
            onClick={() => {
              if (pinned === i.id) release()
              else {
                setPinned(i.id)
                setActive(0)
              }
            }}
          >
            {i.icon}
            <span className="sr-only">{i.title}</span>
          </button>
        ))}
      </div>
      {!visibleId ? <span className="dock-hint">Coding activity</span> : null}
    </div>
  )

  const cards = (
      <div
        className="dock-cards"
        data-open={visibleId ? 'true' : 'false'}
        data-carousel={carousel ? 'true' : undefined}
        aria-roledescription={carousel ? 'carousel' : undefined}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div className="dock-track" ref={track} onScroll={onScroll} key={pinned ?? 'defaults'}>
          {shown.map((i) => (
            <div key={i.id} className="dock-card" id={`dock-${i.id}`} data-card={i.id} aria-hidden={visibleId !== i.id}>
              <p className="dock-head">
                <span className="activity-title">{i.title}</span>
                <span className="activity-sub">{i.summary}</span>
              </p>
              {i.body}
            </div>
          ))}
        </div>
        {carousel ? (
          <div className="dock-dots" role="tablist" aria-label="Cards">
            {shown.map((i, n) => (
              <button key={i.id} type="button" role="tab" aria-selected={n === active} aria-label={i.title} onClick={() => goTo(n)} />
            ))}
          </div>
        ) : null}
      </div>
  )

  return (
    <div className="activity-dock" data-variant={variant} ref={root}>
      {variant === 'inline' ? (
        <>
          {cards}
          {logos}
        </>
      ) : (
        <>
          {logos}
          {cards}
        </>
      )}
    </div>
  )
}
