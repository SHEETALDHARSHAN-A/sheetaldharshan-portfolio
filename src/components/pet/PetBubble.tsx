'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { BrandIcon } from '@/components/BrandIcon'
import type { SearchDoc } from '@/data/types'
import type { Anchor } from './Pet'
import { highlight, loadEngine, normalize, snippet, typeLabels, type Engine, type Hit, type Segment } from './search'
import styles from './Pet.module.css'

export type Activity = 'opened' | 'waiting' | 'typing' | 'found' | 'empty'

type Props = {
  open: boolean
  anchor: Anchor | null
  mobile: boolean
  away: boolean
  onClose: () => void
  onActivity: (activity: Activity) => void
  onGo: (doc: SearchDoc) => void
  onHome: () => void
}

const QUICK = ['page:projects', 'page:blog', 'page:about', 'page:research', 'page:contact']
const WIDTH = 368

function Marked({ segments }: { segments: Segment[] }) {
  return (
    <>
      {segments.map((s, i) => (s.hit ? <mark key={i}>{s.text}</mark> : <span key={i}>{s.text}</span>))}
    </>
  )
}

/** Where the bubble sits: beside the pet when there is room, otherwise above it. */
function place(anchor: Anchor, mobile: boolean) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const width = Math.min(WIDTH, vw - 24)
  const head = anchor.y + anchor.h * 0.3
  const right = anchor.x + anchor.w * 0.74
  const left = anchor.x + anchor.w * 0.26
  if (!mobile && right + width + 12 < vw) {
    const top = Math.max(12, Math.min(head - 48, vh - 300))
    return { style: { left: right, top, width, maxHeight: vh - top - 12 }, tail: 'left', tailAt: head - top }
  }
  if (!mobile && left - width - 12 > 0) {
    const top = Math.max(12, Math.min(head - 48, vh - 300))
    return { style: { left: left - width, top, width, maxHeight: vh - top - 12 }, tail: 'right', tailAt: head - top }
  }
  const x = Math.max(12, Math.min(anchor.x + anchor.w / 2 - width / 2, vw - width - 12))
  const bottom = vh - (anchor.y + anchor.h * 0.08)
  return { style: { left: x, bottom, width, maxHeight: Math.min(520, anchor.y + anchor.h * 0.08 - 12) }, tail: 'bottom', tailAt: anchor.x + anchor.w / 2 - x }
}

export function PetBubble({ open, anchor, mobile, away, onClose, onActivity, onGo, onHome }: Props) {
  const [engine, setEngine] = useState<Engine | null>(null)
  const [failed, setFailed] = useState(false)
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const activityRef = useRef(onActivity)
  activityRef.current = onActivity

  /* load the index and focus the field when opened */
  useEffect(() => {
    if (!open) return
    setFailed(false)
    loadEngine().then(setEngine, () => setFailed(true))
    activityRef.current('opened')
  }, [open])

  /* close on outside press or Escape; return focus to the pet */
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      const target = e.target as Element | null
      if (boxRef.current?.contains(target) || target?.closest?.('[data-pet]')) return
      onClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      onClose()
      ;(document.querySelector('[data-pet]') as HTMLElement | null)?.focus()
    }
    document.addEventListener('pointerdown', onDown, true)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown, true)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  const results: Hit[] = useMemo(() => (engine && q.trim() ? engine.search(q, 8) : []), [engine, q])
  const suggestion = useMemo(() => (engine && q.trim() && results.length === 0 ? engine.suggest(q) : undefined), [engine, q, results.length])
  const quick: SearchDoc[] = useMemo(() => {
    if (!engine) return []
    const pages = QUICK.map((id) => engine.docs.find((d) => d.id === id)).filter((d): d is SearchDoc => Boolean(d))
    const featured = engine.docs.filter((d) => d.type === 'project' && d.featured).slice(0, 3)
    return [...pages, ...featured]
  }, [engine])
  const items: SearchDoc[] = q.trim() ? results : quick

  /* the pet works while you type, then reacts to what it found */
  const found = results.length > 0
  useEffect(() => {
    if (!open || !engine) return
    if (!q.trim()) {
      activityRef.current('waiting')
      return
    }
    // Only after a real pause in typing, and only when the outcome changes, so it doesn't flicker per keystroke.
    const t = window.setTimeout(() => activityRef.current(found ? 'found' : 'empty'), 900)
    return () => window.clearTimeout(t)
  }, [q, found, open, engine])

  useEffect(() => setActive(0), [q])
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])
  useEffect(() => {
    if (!open) setQ('')
  }, [open])

  if (!open || !anchor) return null
  const { style, tail, tailAt } = place(anchor, mobile)

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!items.length) return
      setActive((i) => (i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const doc = items[active]
      if (doc) onGo(doc)
      else if (suggestion) setQ(suggestion)
    }
  }

  const sub = (doc: SearchDoc, terms: string[]) => {
    const head = normalize(`${doc.title} ${doc.subtitle ?? ''}`)
    const explained = !terms.length || terms.every((t) => head.includes(t))
    const text = explained || !doc.body ? doc.subtitle : snippet(doc.body, terms)
    return text ? highlight(text, terms) : null
  }

  return (
    <div
      ref={boxRef}
      id="pet-bubble"
      className={styles.bubble}
      role="dialog"
      aria-label="Site search"
      data-tail={tail}
      style={{ ...style, ['--tail' as string]: `${Math.round(tailAt)}px` }}
    >
      <p className={styles.say}>{q.trim() ? (engine ? (found ? 'Here’s what I found.' : 'Hmm, nothing for that yet.') : 'Looking…') : 'Hi! Where do you want to go?'}</p>
      <div className={styles.field}>
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M13 13l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Projects, Rust, agents, contact…"
          role="combobox"
          aria-expanded={items.length > 0}
          aria-controls="pet-results"
          aria-activedescendant={items.length ? `pet-opt-${active}` : undefined}
          aria-autocomplete="list"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="go"
        />
      </div>

      {failed ? (
        <p className={styles.empty}>I couldn’t load the search right now. Try again in a moment.</p>
      ) : !engine ? (
        <p className={styles.empty}>Warming up…</p>
      ) : q.trim() && !results.length ? (
        <p className={styles.empty}>
          Nothing for “{q.trim()}”.
          {suggestion ? (
            <>
              {' '}Did you mean{' '}
              <button type="button" className={styles.suggest} onClick={() => setQ(suggestion)}>
                {suggestion}
              </button>
              ?
            </>
          ) : (
            ' Try a project name, a technology, or “contact”.'
          )}
        </p>
      ) : (
        <>
          {!q.trim() ? <p className={styles.label}>Jump to</p> : null}
          <ul ref={listRef} id="pet-results" role="listbox" aria-label="Results" className={styles.list}>
            {items.map((doc, i) => {
              const terms = 'terms' in doc ? (doc as Hit).terms : []
              const line = sub(doc, terms)
              return (
                <li
                  key={doc.id}
                  id={`pet-opt-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={i === active}
                  className={styles.item}
                  onPointerMove={() => setActive(i)}
                  onClick={() => onGo(doc)}
                >
                  <span className={styles.badge} data-type={doc.type}>
                    {typeLabels[doc.type]}
                  </span>
                  <span className={styles.text}>
                    <span className={styles.title}>
                      {doc.external ? <BrandIcon href={doc.href} name={doc.title} size={14} /> : null}
                      <Marked segments={highlight(doc.title, terms)} />
                    </span>
                    {line ? (
                      <span className={styles.sub}>
                        <Marked segments={line} />
                      </span>
                    ) : null}
                  </span>
                  <span className={styles.go} aria-hidden="true">
                    {doc.external ? '↗' : '→'}
                  </span>
                </li>
              )
            })}
          </ul>
        </>
      )}

      <div className={styles.foot}>
        {mobile ? <span>Tap a result to go</span> : <span>↑↓ choose · ↵ open · esc close</span>}
        {away ? (
          <button type="button" className={styles.home} onClick={onHome}>
            Back to my spot
          </button>
        ) : null}
      </div>
    </div>
  )
}
