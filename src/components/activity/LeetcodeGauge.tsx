'use client'

import { useRef, useState } from 'react'
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
 * how many problems that level has. Hover the ring for the acceptance rate, or a level for its
 * "Beats x%"; a click keeps that view, and clicking it again goes back to the total. The ring's
 * background stays still; only the progress line grows, from the bottom of the gauge upward.
 */
export function LeetcodeGauge({ data }: { data: LeetcodeStats }) {
  const [selected, setSelected] = useState<View | null>(null)
  const [hovered, setHovered] = useState<View | null>(null)
  const view: View = hovered ?? selected ?? 'solved'
  // Click selects; clicking the selected one again returns to the total (and drops the hover preview).
  // After deselecting, the arcs re-render under the cursor and React reports a fresh "enter";
  // ignore hover on that item until the pointer really leaves it.
  const quiet = useRef<View | null>(null)
  const toggle = (v: View) => {
    if (selected === v) {
      quiet.current = v
      setSelected(null)
      setHovered(null)
    } else setSelected(v)
  }
  const hover = (v: View) => (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && quiet.current !== v) setHovered(v)
  }
  const unhover = () => {
    quiet.current = null
    setHovered(null)
  }

  const { solved, available, attempting, submissions, beats } = data
  const level = view === 'easy' || view === 'medium' || view === 'hard' ? view : null

  // Segment layout at rest: three arcs proportional to each level's problem count, with small gaps.
  const usable = SWEEP - GAP * 2
  const lengths = LEVELS.map((l) => (available.all ? (available[l.key] / available.all) * usable : usable / 3))
  const segments = LEVELS.map((l, i) => {
    const len = lengths[i]
    const start = lengths.slice(0, i).reduce((n, x) => n + x + GAP, 0)
    return { ...l, start, len, fill: available[l.key] ? (solved[l.key] / available[l.key]) * len : 0 }
  })

  const arc = (start: number, len: number) => ({ strokeDasharray: `${Math.max(0, len)} ${C}`, strokeDashoffset: -start })
  const acceptance = submissions.total ? (submissions.accepted / submissions.total) * 100 : 0

  return (
    <div className="lcg" data-view={view} onPointerLeave={unhover}>
      <button
        type="button"
        className="lcg-ring"
        aria-label={`${solved.all} of ${available.all} solved; ${acceptance.toFixed(2)}% acceptance`}
        aria-pressed={selected === 'acceptance'}
        onPointerEnter={hover('acceptance')}
        onPointerLeave={unhover}
        onClick={() => toggle('acceptance')}
      >
        <svg viewBox="0 0 128 128" aria-hidden="true">
          <g transform="rotate(135 64 64)">
            {segments.map((s) => {
              const showSeg = !level
              const focused = level === s.key
              // Rest: each level owns its arc. Level view: that level spans the whole gauge.
              const track = focused ? arc(0, SWEEP) : showSeg ? arc(s.start, s.len) : arc(s.start, 0)
              const fillLen = focused ? (available[s.key] ? (solved[s.key] / available[s.key]) * SWEEP : 0) : showSeg ? s.fill : 0
              const fill = focused ? arc(0, fillLen) : arc(s.start, showSeg ? fillLen : 0)
              return (
                <g key={s.key}>
                  {/* Zero-length arcs would still draw a dot through their round caps, so they fade out. */}
                  <circle className="lcg-track" cx="64" cy="64" r={R} style={{ ...track, stroke: focused ? 'var(--surface-strong)' : s.color, opacity: focused || showSeg ? undefined : 0 }} data-dim={!focused} />
                  {/* Re-mounted on every view change, so the line grows again from its start. */}
                  <circle key={view} className="lcg-fill" cx="64" cy="64" r={R} style={{ ...fill, stroke: s.color, opacity: fillLen > 0 && (focused || showSeg) ? 1 : 0, ['--from' as string]: `0 ${C}` }} />
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
              aria-pressed={selected === l.key}
              onPointerEnter={hover(l.key)}
              onPointerLeave={unhover}
              onClick={() => toggle(l.key)}
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
