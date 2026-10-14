'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { ProjectSummary } from '@/data/types'
import { Picture } from '@/components/Media/Picture'

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * The card number rolls like a clock: each digit makes one slow step from its previous value
 * to the new one (the old digit slides up and out, the new one rises in), the first digit
 * first and the second digit a moment later.
 */
function RollingNumber({ from, to }: { from: string; to: string }) {
  return (
    <span className="roll" aria-hidden="true" key={`${from}-${to}`}>
      {to.split('').map((digit, i) => (
        <span className="roll-digit" key={i} style={{ animationDelay: `${i * 160}ms` }}>
          <span>{from[i] ?? '0'}</span>
          <span>{digit}</span>
        </span>
      ))}
    </span>
  )
}

/**
 * Project index in the Yakudoo structure: a full-bleed visual, a column of numbered
 * thumbnails, and title tabs that overlay the visual as a stair-step edge. Activating a row
 * (hover, focus, arrow keys) turns it into a card: the number rolls once, the thumbnail
 * squeezes into a sliver, and the large title, category and arrow cross-fade in. The visual
 * wipes in from the right.
 */
export function ProjectExplorer({ projects }: { projects: ProjectSummary[] }) {
  const [active, setActive] = useState(0)
  const [previous, setPrevious] = useState<number | null>(null)
  const [intro, setIntro] = useState(true)
  const listRef = useRef<HTMLDivElement>(null)

  // Page-load choreography: left panel, then the visual, then the cards one by one.
  useEffect(() => {
    const timer = window.setTimeout(() => setIntro(false), 1900 + projects.length * 140)
    return () => window.clearTimeout(timer)
  }, [projects.length])

  const select = useCallback((index: number) => {
    setActive((current) => {
      if (current === index) return current
      setPrevious(current)
      return index
    })
  }, [])

  const onKey = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault()
        select((active + 1) % projects.length)
      } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault()
        select((active - 1 + projects.length) % projects.length)
      }
    },
    [active, projects.length, select],
  )

  useEffect(() => {
    const el = listRef.current?.querySelectorAll<HTMLElement>('.project-row')[active]
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [active])

  const project = projects[active]
  if (!project) return null
  const rollFrom = previous === null ? '00' : pad(previous + 1)

  return (
    <section className={`yk${intro ? ' yk-intro' : ''}`} aria-label="Project explorer">
      <div className="yk-stage" aria-live="polite">
        {projects.map((item, index) => {
          const state = index === active ? 'active' : index === previous ? 'leaving' : 'idle'
          return (
            <div className={`stage-media ${state}`} key={item.id} aria-hidden={index !== active} data-accent={item.accent}>
              {item.heroImage ? (
                <Picture media={item.heroImage} size="original" sizes="(max-width: 960px) 100vw, 85vw" priority={index === 0} />
              ) : item.heroVideo ? (
                <video autoPlay loop muted playsInline preload={index === active ? 'auto' : 'metadata'} src={item.heroVideo.url} />
              ) : (
                <div className="stage-placeholder">
                  <span className="mark">{item.title}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="yk-list" ref={listRef} onKeyDown={onKey} role="list">
        {projects.map((item, index) => {
          const number = pad(index + 1)
          const current = index === active
          const category = item.category ?? item.kindLabel
          return (
            <Link
              key={item.id}
              href={`/projects/${item.slug}`}
              className={`project-row${current ? ' active' : ''}`}
              data-accent={item.accent}
              style={{ '--i': index } as React.CSSProperties}
              onMouseEnter={() => select(index)}
              onFocus={() => select(index)}
              aria-current={current ? 'true' : undefined}
              role="listitem"
              aria-label={`${number} ${item.title}, ${category}`}
            >
              {/* Card layer: slate background, large number, title, category, arrow. Fades in over the row. */}
              <span className="card" aria-hidden="true">
                <span className="card-n">{current && <RollingNumber from={rollFrom} to={number} />}</span>
                <span className="card-text">
                  <span className="card-t">{item.title}</span>
                  <span className="card-k">{category}</span>
                </span>
                <span className="card-arrow">→</span>
              </span>
              {/* Row layer: number, thumbnail, tab. The thumbnail squeezes into the sliver on the card. */}
              <span className="n">{number}</span>
              <span className="thumb">
                {item.thumbnail ? <Picture media={item.thumbnail} size="small" sizes="148px" /> : item.heroImage ? <Picture media={item.heroImage} size="small" sizes="148px" /> : <span className="thumb-blank" data-accent={item.accent} />}
              </span>
              <span className="tab">
                <span className="t">{item.title}</span>
              </span>
            </Link>
          )
        })}
      </div>

      <div className="stage-card sr-only" aria-live="polite">
        <span className="t">{project.title}</span>
      </div>
      <Link className="yk-open" href={`/projects/${project.slug}`}>
        Open project <span aria-hidden="true">→</span>
      </Link>
    </section>
  )
}
