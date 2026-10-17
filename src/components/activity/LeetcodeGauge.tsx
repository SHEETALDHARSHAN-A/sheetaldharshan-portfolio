'use client'

import { useEffect, useState } from 'react'
import type { LeetcodeStats } from '@/data/activity'

type Level = 'easy' | 'medium' | 'hard'
type View = 'solved' | 'acceptance' | Level

const LEVELS: { key: Level; label: string; color: string }[] = [
  { key: 'easy', label: 'Easy', color: '#1cbaba' },
  { key: 'medium', label: 'Med.', color: '#ffb700' },
  { key: 'hard', label: 'Hard', color: '#f63737' },
]

// A 270° gauge open at the bottom, like LeetCode's profile: circle of radius R, rotated to start at 135°.
const R = 52
const C = 2 * Math.PI * R
const SWEEP = C * 0.75
const GAP = 7

const pct = (n: number) => {
  const [whole, frac = '00'] = n.toFixed(2).split('.')
  return { whole, frac: `.${frac}%` }
}

/**
 * LeetCode-style progress gauge. At rest: solved out of all problems, one arc per difficulty sized by
 * how many problems that level has. Hover the ring for the acceptance rate; hover a level for its
 * "Beats x%". Taps do the same on touch screens. Arcs draw in on load and glide between views.
 */
export function LeetcodeGauge({ data }: { data: LeetcodeStats }) {
  const [view, setView] = useState<View>('solved')
  const [drawn, setDrawn] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setDrawn(true), 80)
    return () => window.clearTimeout(t)
  }, [])

  const { solved, available, attempting, submissions, beats } = data
  const level = view === 'easy' || view === 'medium' || view === 'hard' ? view : null

  // Segment layout at rest: three arcs proportional to each level's problem count, with small gaps.
  let cursor = 0
  const usable = SWEEP - GAP * 2
  const segments = LEVELS.map((l) => {
    const len = available.all ? (available[l.key] / available.all) * usable : usable / 3
    const seg = { ...l, start: cursor, len, fill: available[l.key] ? (solved[l.key] / available[l.key]) * len : 0 }
    cursor += len + GAP
    return seg
  })

  const arc = (start: number, len: number) => ({ strokeDasharray: `${Math.max(0, len)} ${C}`, strokeDashoffset: -start })
  const acceptance = submissions.total ? (submissions.accepted / submissions.total) * 100 : 0

  return (
    <div className="lcg" data-view={view} onPointerLeave={() => setView('solved')}>
      <button
        type="button"
        className="lcg-ring"
        aria-label={`${solved.all} of ${available.all} solved; ${acceptance.toFixed(2)}% acceptance`}
        onPointerEnter={(e) => e.pointerType === 'mouse' && setView('acceptance')}
        onFocus={() => setView('acceptance')}
        onBlur={() => setView('solved')}
        onClick={() => setView('acceptance')}
      >
        <svg viewBox="0 0 128 128" aria-hidden="true">
          <g transform="rotate(135 64 64)">
            {segments.map((s) => {
              const showSeg = !level
              const focused = level === s.key
              // Rest: each level owns its arc. Level view: that level spans the whole gauge.
              const track = focused ? arc(0, SWEEP) : showSeg ? arc(s.start, s.len) : arc(s.start, 0)
              const fillLen = focused ? (available[s.key] ? (solved[s.key] / available[s.key]) * SWEEP : 0) : showSeg ? s.fill : 0
              const fill = focused ? arc(0, drawn ? fillLen : 0) : arc(s.start, drawn && showSeg ? fillLen : 0)
              return (
                <g key={s.key}>
                  {/* Zero-length arcs would still draw a dot through their round caps, so they fade out. */}
                  <circle className="lcg-track" cx="64" cy="64" r={R} style={{ ...track, stroke: focused ? 'var(--surface-strong)' : s.color, opacity: focused || showSeg ? undefined : 0 }} data-dim={!focused} />
                  <circle className="lcg-fill" cx="64" cy="64" r={R} style={{ ...fill, stroke: s.color, opacity: fillLen > 0 && drawn && (focused || showSeg) ? 1 : 0 }} />
                </g>
              )
            })}
          </g>
        </svg>
        <span className="lcg-center" key={view}>
          {view === 'solved' ? (
            <>
              <span className="lcg-big">
                {solved.all}
                <small>/{available.all}</small>
              </span>
              <span className="lcg-caption">
                <span className="lcg-check" aria-hidden="true">
                  ✓
                </span>{' '}
                Solved
              </span>
            </>
          ) : view === 'acceptance' ? (
            <>
              <span className="lcg-big">
                {pct(acceptance).whole}
                <small>{pct(acceptance).frac}</small>
              </span>
              <span className="lcg-caption">Acceptance</span>
            </>
          ) : (
            <>
              <span className="lcg-caption">Beats</span>
              <span className="lcg-big">
                {pct(beats[view]).whole}
                <small>{pct(beats[view]).frac}</small>
              </span>
            </>
          )}
        </span>
        <span className="lcg-foot">
          {view === 'acceptance' ? `${submissions.total} submissions` : `${level ? attempting[level] : attempting.all} Attempting`}
        </span>
      </button>

      <ul className="lcg-levels">
        {LEVELS.map((l) => (
          <li key={l.key}>
            <button
              type="button"
              data-active={view === l.key}
              onPointerEnter={(e) => e.pointerType === 'mouse' && setView(l.key)}
              onFocus={() => setView(l.key)}
              onBlur={() => setView('solved')}
              onClick={() => setView(l.key)}
            >
              <span className="lcg-level" style={{ color: l.color }}>
                {l.label}
              </span>
              <span className="lcg-count">
                {solved[l.key]}/{available[l.key]}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
