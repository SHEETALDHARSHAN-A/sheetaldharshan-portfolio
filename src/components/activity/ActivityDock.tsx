'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

export type DockItem = { id: string; title: string; summary: string; icon: ReactNode; body: ReactNode; defaultOpen: boolean }


/** Scrolls the card track exactly to one card (its own position, so sub-pixel widths never leave a sliver). */
function scrollToCard(el: HTMLElement | null, index: number, smooth = true) {
  const card = el?.children[index] as HTMLElement | undefined
  if (el && card) el.scrollTo({ left: card.offsetLeft, behavior: smooth ? 'smooth' : 'instant' })
}

/**
 * Coding-activity dock: overlapping round logos like Magic UI's AvatarCircles, with the cards above
 * them. In the sidebar the cards pop up over the avatar without moving anything (the pet steps up
 * above them); on the About page ("inline") they sit in the page above the logos.
 *
 * Hovering a logo keeps it where it is and nudges the others a little away, so each is easy to click.
 *
 * - With two or more cards open by default (set in the admin), the pop-up is a carousel: it slides
 *   through them on its own, can be scrolled or swiped, and pauses while hovered or held.
 * - Clicking a logo pins its card. Clicking the same logo again, clicking outside or Escape releases
 *   it, back to the default view (the carousel, the one default card, or closed).
 */
export function ActivityDock({ items, variant = 'sidebar', seconds = 10 }: { items: DockItem[]; variant?: 'sidebar' | 'inline'; seconds?: number }) {
  const defaults = items.filter((i) => i.defaultOpen)
  const [pinned, setPinned] = useState<string | null>(null)
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hovered, setHovered] = useState<number | null>(null)
  const root = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)

  // Every card sits in one track, so the cards keep one height (the tallest) and nothing around them
  // moves as they change. The carousel cycles through the default cards; a pinned card holds still.
  const indexOf = (id: string) => items.findIndex((i) => i.id === id)
  const rotation = defaults.map((d) => indexOf(d.id))
  const isOpen = pinned !== null || rotation.length > 0
  const carousel = !pinned && rotation.length > 1
  const visibleId = isOpen ? (items[Math.min(active, items.length - 1)]?.id ?? null) : null

  const goTo = (index: number, smooth = true) => scrollToCard(track.current, index, smooth)

  // Start on the first default card.
  const startAt = rotation[0] ?? 0
  useEffect(() => {
    if (startAt) scrollToCard(track.current, startAt, false)
  }, [startAt])

  const release = () => {
    setPinned(null)
    if (firstDefault >= 0) goTo(firstDefault)
  }

  // In the sidebar the pet moves up above the card while one shows (Pet.tsx watches this attribute).
  useEffect(() => {
    if (variant !== 'sidebar') return
    const html = document.documentElement
    if (visibleId) html.setAttribute('data-dock-open', 'true')
    else html.removeAttribute('data-dock-open')
  }, [visibleId, variant])
  useEffect(() => () => {
    if (variant === 'sidebar') document.documentElement.removeAttribute('data-dock-open')
  }, [variant])

  // Releasing a pinned card: clicking elsewhere or Escape.
  const firstDefault = items.findIndex((i) => i.defaultOpen)
  useEffect(() => {
    if (!pinned) return
    const letGo = () => {
      setPinned(null)
      if (firstDefault >= 0) scrollToCard(track.current, firstDefault)
    }
    const onDown = (e: PointerEvent) => !root.current?.contains(e.target as Node) && letGo()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && letGo()
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [pinned, firstDefault])

  // The carousel moves on through the default cards unless hovered, held, focused, hidden or reduced motion.
  const rotationKey = rotation.join(',')
  useEffect(() => {
    if (!carousel || paused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const order = rotationKey.split(',').map(Number)
    const t = window.setInterval(() => {
      const el = track.current
      if (!el || document.visibilityState !== 'visible') return
      const now = Math.round(el.scrollLeft / el.clientWidth)
      const at = order.indexOf(now)
      scrollToCard(el, order[(at + 1) % order.length])
    }, seconds * 1000)
    return () => window.clearInterval(t)
  }, [carousel, paused, rotationKey, seconds])

  // When the track changes width (sidebar or photo column resized, window resized), stay on the same card.
  useEffect(() => {
    const el = track.current
    if (!el) return
    const ro = new ResizeObserver(() => scrollToCard(el, Math.round(el.scrollLeft / Math.max(1, el.clientWidth)), false))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const onScroll = () => {
    const el = track.current
    if (!el || !el.clientWidth) return
    const now = Math.round(el.scrollLeft / el.clientWidth)
    setActive(now)
    // Swiping while a card is pinned moves the pin along with it.
    if (pinned && items[now] && items[now].id !== pinned && Math.abs(el.scrollLeft - now * el.clientWidth) < 2) setPinned(items[now].id)
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
                goTo(n)
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
        data-open={isOpen ? 'true' : 'false'}
        data-carousel={carousel ? 'true' : undefined}
        aria-roledescription={carousel ? 'carousel' : undefined}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div className="dock-track" ref={track} onScroll={onScroll}>
          {items.map((i) => (
            <div key={i.id} className="dock-card" id={`dock-${i.id}`} data-card={i.id} aria-hidden={visibleId !== i.id}>
              <p className="dock-head">
                <span className="activity-title">{i.title}</span>
                <span className="activity-sub">{i.summary}</span>
              </p>
              {i.body}
            </div>
          ))}
        </div>
        {items.length > 1 ? (
          <div className="dock-dots" role="tablist" aria-label="Cards">
            {items.map((i, n) => (
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
