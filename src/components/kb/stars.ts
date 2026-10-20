'use client'

import { useEffect, useState } from 'react'
import { askToSignIn, currentReader } from './reader'

/**
 * Channel stars, shared by the sidebar and the channel header so both update together.
 * Loaded once per page from /api/kb/stars; toggling posts to /api/kb/star.
 */
type State = { counts: Record<string, number>; mine: string[] }
let state: State = { counts: {}, mine: [] }
let loading: Promise<void> | null = null
const listeners = new Set<(s: State) => void>()
const emit = () => listeners.forEach((l) => l(state))

/** After signing in or out, "your stars" change. */
export function reloadStars() {
  loading = null
  return load()
}

function load() {
  loading ??= fetch('/api/kb/stars', { credentials: 'include' })
    .then((r) => (r.ok ? r.json() : null))
    .then((s: State | null) => {
      if (s) state = s
      emit()
    })
    .catch(() => undefined)
  return loading
}

export function useStars(): State & { toggle: (id: string) => Promise<void> } {
  const [s, setS] = useState(state)
  useEffect(() => {
    listeners.add(setS)
    void load()
    return () => void listeners.delete(setS)
  }, [])
  const toggle = async (id: string) => {
    if (!currentReader()) {
      askToSignIn('to star channels')
      return
    }
    const on = state.mine.includes(id)
    // Show it at once; the server's answer corrects the count.
    state = { counts: { ...state.counts, [id]: Math.max(0, (state.counts[id] ?? 0) + (on ? -1 : 1)) }, mine: on ? state.mine.filter((m) => m !== id) : [...state.mine, id] }
    emit()
    const res = await fetch('/api/kb/star', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ channel: id }) }).catch(() => null)
    const body = (await res?.json().catch(() => null)) as { starred?: boolean; count?: number } | null
    if (body && typeof body.count === 'number') {
      state = { counts: { ...state.counts, [id]: body.count }, mine: body.starred ? [...new Set([...state.mine, id])] : state.mine.filter((m) => m !== id) }
      emit()
    }
  }
  return { ...s, toggle }
}
