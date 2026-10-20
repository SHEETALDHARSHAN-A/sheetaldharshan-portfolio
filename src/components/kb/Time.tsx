'use client'

import { useEffect, useState } from 'react'

/** One shared clock, ticking every 30 seconds, so "2 min ago" stays true while the page is open. */
let now = 0
const subs = new Set<(n: number) => void>()
let timer = 0
function useNow() {
  const [n, setN] = useState(now)
  useEffect(() => {
    subs.add(setN)
    if (!timer) {
      now = Date.now()
      timer = window.setInterval(() => {
        now = Date.now()
        subs.forEach((s) => s(now))
      }, 30_000)
    }
    setN(Date.now())
    return () => {
      subs.delete(setN)
      if (!subs.size) {
        window.clearInterval(timer)
        timer = 0
      }
    }
  }, [])
  return n
}

const exact = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })

export function relative(iso: string, n: number): string {
  const then = new Date(iso).getTime()
  const s = Math.max(0, (n - then) / 1000)
  if (s < 45) return 'just now'
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))} min ago`
  if (s < 86400) return `${Math.round(s / 3600)} h ago`
  const days = Math.floor(s / 86400)
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.round(days / 7)} wk ago`
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', ...(d.getFullYear() !== new Date(n).getFullYear() ? { year: 'numeric' } : {}) })
}

/** "5 min ago", with the exact date and time on hover; "· edited" when it was changed later. */
export function Time({ iso, edited }: { iso: string; edited?: string | null }) {
  const n = useNow()
  if (!n) return <time dateTime={iso} className="kb-time" />
  return (
    <span className="kb-time">
      <time dateTime={iso} title={exact(iso)}>
        {relative(iso, n)}
      </time>
      {edited ? (
        <span className="kb-edited" title={`Edited ${exact(edited)}`}>
          {' '}
          · edited
        </span>
      ) : null}
    </span>
  )
}
