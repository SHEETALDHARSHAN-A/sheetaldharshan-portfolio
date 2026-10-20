'use client'

import { useEffect, useState } from 'react'

/**
 * The signed-in ./stdout reader, shared by every component on the page (sidebar stars,
 * ratings, comments). Loaded once from /api/kb/me; `askToSignIn()` opens the sign-in dialog.
 */
export type Reader = { id: number; name: string; avatar?: string; provider: string; verified: boolean; github?: string }
type State = { reader: Reader | null; ready: boolean }

let state: State = { reader: null, ready: false }
let loading: Promise<void> | null = null
const listeners = new Set<(s: State) => void>()
const emit = () => listeners.forEach((l) => l(state))

export function setReader(reader: Reader | null) {
  state = { reader, ready: true }
  emit()
}

function load() {
  loading ??= fetch('/api/kb/me', { credentials: 'include', cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : { reader: null }))
    .then((b: { reader: Reader | null }) => setReader(b.reader))
    .catch(() => setReader(null))
  return loading
}

export function useReader(): State & { signOut: (everywhere?: boolean) => Promise<void> } {
  const [s, setS] = useState(state)
  useEffect(() => {
    listeners.add(setS)
    void load()
    return () => void listeners.delete(setS)
  }, [])
  /** Signs out here, or (`everywhere`) on every device this reader is signed in on. */
  const signOut = async (everywhere = false) => {
    await fetch(everywhere ? '/api/kb/signout-all' : '/api/kb/signout', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: '{}' }).catch(() => null)
    setReader(null)
    window.dispatchEvent(new Event('kb-signed-out'))
  }
  return { ...s, signOut }
}

/** Opens the sign-in dialog, with a line saying why (e.g. "to like comments"). */
export const askToSignIn = (why?: string) => window.dispatchEvent(new CustomEvent('kb-signin', { detail: why }))
export const currentReader = () => state.reader
