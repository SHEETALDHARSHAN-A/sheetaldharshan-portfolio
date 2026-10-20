'use client'

import { useEffect, useState } from 'react'
import { currentReader } from './reader'

/** The signed-in reader's own channels, shared by the side column, the Save button and their pages. */
export type List = { id: number; name: string; description: string; emoji: string; posts: number[]; count: number; updatedAt: string; items?: { id: number; slug: string; title: string }[] }
type Result = { ok?: boolean; error?: string; errors?: Record<string, string>; list?: List }

let lists: List[] = []
let loading: Promise<void> | null = null
const subs = new Set<(l: List[]) => void>()
const emit = () => subs.forEach((s) => s(lists))

export function reloadLists() {
  loading = fetch('/api/kb/lists', { credentials: 'include', cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : { lists: [] }))
    .then((b: { lists: List[] }) => {
      lists = b.lists
      emit()
    })
    .catch(() => undefined)
  return loading
}

const call = async (path: string, body: object): Promise<Result> => {
  const res = await fetch(`/api/kb/${path}`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).catch(() => null)
  return ((await res?.json().catch(() => null)) ?? { error: 'Could not reach the server.' }) as Result
}
export const listError = (r: Result) => (r.errors ? Object.values(r.errors)[0] : r.error) ?? 'Something went wrong.'

function upsert(l: List) {
  const old = lists.find((x) => x.id === l.id)
  lists = [...lists.filter((x) => x.id !== l.id), { ...l, items: old?.items }].sort((a, b) => a.name.localeCompare(b.name))
  emit()
  // Fetch the saved posts' titles again for the side column's tree.
  void reloadLists()
}

export const listActions = {
  async create(name: string, extra: { description?: string; emoji?: string; post?: string | number } = {}) {
    const r = await call('list-create', { name, ...extra })
    if (r.list) upsert(r.list)
    return r
  },
  async update(id: number, fields: { name: string; description?: string; emoji?: string }) {
    const r = await call('list-update', { id, ...fields })
    if (r.list) upsert(r.list)
    return r
  },
  async remove(id: number) {
    const r = await call('list-delete', { id })
    if (r.ok) {
      lists = lists.filter((x) => x.id !== id)
      emit()
    }
    return r
  },
  async save(id: number, post: string | number, saved: boolean) {
    const r = await call('list-save', { id, post, saved })
    if (r.list) upsert(r.list)
    return r
  },
}

export function useLists(readerId?: number | null): List[] {
  const [l, setL] = useState(lists)
  useEffect(() => {
    subs.add(setL)
    return () => void subs.delete(setL)
  }, [])
  // Load again whenever the signed-in reader changes (or sign out empties them).
  useEffect(() => {
    if (readerId && currentReader()) void reloadLists()
    else {
      lists = []
      emit()
    }
  }, [readerId])
  return l
}
