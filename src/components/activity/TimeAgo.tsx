'use client'

import { useEffect, useState } from 'react'

const format = (ms: number, now: number) => {
  const min = Math.max(0, Math.round((now - ms) / 60000))
  if (min < 1) return 'just now'
  if (min < 60) return `${min} min ago`
  const h = Math.round(min / 60)
  if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`
  const d = Math.round(h / 24)
  return `${d} day${d === 1 ? '' : 's'} ago`
}

/** "2 days ago", worked out in the visitor's browser so a cached page never shows a stale age. */
export function TimeAgo({ at }: { at: number }) {
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    setNow(Date.now())
    const t = window.setInterval(() => setNow(Date.now()), 60000)
    return () => window.clearInterval(t)
  }, [])
  return (
    <time dateTime={new Date(at).toISOString()} title={new Date(at).toUTCString()} suppressHydrationWarning>
      {now === null ? 'recently' : format(at, now)}
    </time>
  )
}
