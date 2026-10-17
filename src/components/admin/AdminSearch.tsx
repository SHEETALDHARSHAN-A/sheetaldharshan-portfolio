'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { AdminHit } from '@/endpoints/adminSearch'

const KINDS: Record<AdminHit['kind'], string> = { document: 'Content', page: 'Pages & settings', field: 'Fields', action: 'Create' }
const ORDER: AdminHit['kind'][] = ['page', 'document', 'field', 'action']

/**
 * Search at the top of the admin menu (⌘K or / to focus): settings pages, every field, content by
 * title, and "new …" actions. Results come from the CMS config, so new pages and fields show up
 * without changes here.
 */
export function AdminSearch() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [q, setQ] = useState('')
  const [hits, setHits] = useState<AdminHit[]>([])
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement | null)?.closest?.('input, textarea, select, [contenteditable="true"]')
      if ((e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const term = q.trim()
    if (!term) return
    const ctrl = new AbortController()
    const t = window.setTimeout(() => {
      setLoading(true)
      fetch(`/api/admin-search?q=${encodeURIComponent(term)}`, { credentials: 'include', signal: ctrl.signal })
        .then((r) => (r.ok ? r.json() : { hits: [] }))
        .then((d: { hits: AdminHit[] }) => {
          setHits(d.hits)
          setActive(0)
        })
        .catch(() => undefined)
        .finally(() => setLoading(false))
    }, 160)
    return () => {
      window.clearTimeout(t)
      ctrl.abort()
    }
  }, [q])

  const shown = q.trim() ? hits : []
  const grouped = ORDER.map((kind) => ({ kind, items: shown.filter((h) => h.kind === kind) })).filter((g) => g.items.length)
  const flat = grouped.flatMap((g) => g.items)

  const go = (hit: AdminHit | undefined) => {
    if (!hit) return
    setOpen(false)
    setQ('')
    inputRef.current?.blur()
    router.push(hit.href)
  }

  return (
    <div className="admin-search" onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setOpen(false)}>
      <style>{`
        .admin-search { position: relative; margin: 0 0 16px; }
        .admin-search input { width: 100%; height: 36px; padding: 0 44px 0 32px; border-radius: var(--style-radius-m, 6px); border: 1px solid var(--theme-elevation-150); background: var(--theme-input-bg, var(--theme-elevation-50)); color: var(--theme-text); font: inherit; font-size: 13px; outline: none; }
        .admin-search input:focus { border-color: var(--theme-success-500); }
        .admin-search .icon { position: absolute; left: 10px; top: 10px; width: 15px; height: 15px; color: var(--theme-elevation-500); pointer-events: none; }
        .admin-search kbd { position: absolute; right: 8px; top: 8px; padding: 1px 6px; border-radius: 4px; border: 1px solid var(--theme-elevation-150); font: 11px/18px inherit; color: var(--theme-elevation-500); pointer-events: none; }
        .admin-search .panel { position: absolute; z-index: 50; left: 0; top: 42px; width: min(420px, 86vw); max-height: 60vh; overflow-y: auto; padding: 6px; border-radius: var(--style-radius-m, 8px); border: 1px solid var(--theme-elevation-150); background: var(--theme-bg); box-shadow: 0 16px 40px rgba(0,0,0,.35); }
        .admin-search .group { margin: 8px 8px 4px; font-size: 10.5px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--theme-elevation-500); }
        .admin-search button { display: grid; gap: 1px; width: 100%; padding: 7px 10px; border: 0; border-radius: 6px; background: transparent; color: var(--theme-text); font: inherit; text-align: left; cursor: pointer; }
        .admin-search button[aria-selected='true'] { background: var(--theme-elevation-100); }
        .admin-search button span { font-size: 13px; }
        .admin-search button small { font-size: 11.5px; color: var(--theme-elevation-500); overflow-wrap: anywhere; }
        .admin-search .empty { margin: 10px; font-size: 13px; color: var(--theme-elevation-500); }
      `}</style>
      <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-expanded={open && Boolean(q.trim())}
        aria-controls="admin-search-results"
        aria-label="Search the admin"
        placeholder="Search settings, fields, content…"
        value={q}
        onChange={(e) => {
          setQ(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActive((a) => Math.min(flat.length - 1, a + 1))
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActive((a) => Math.max(0, a - 1))
          } else if (e.key === 'Enter') {
            e.preventDefault()
            go(flat[active])
          } else if (e.key === 'Escape') {
            setOpen(false)
            inputRef.current?.blur()
          }
        }}
      />
      <kbd>⌘K</kbd>
      {open && q.trim() ? (
        <div className="panel" id="admin-search-results" role="listbox">
          {grouped.map((g) => (
            <div key={g.kind}>
              <p className="group">{KINDS[g.kind]}</p>
              {g.items.map((hit) => {
                const i = flat.indexOf(hit)
                return (
                  <button key={`${hit.kind}${hit.href}${hit.label}`} type="button" role="option" aria-selected={i === active} onMouseEnter={() => setActive(i)} onClick={() => go(hit)}>
                    <span>{hit.label}</span>
                    <small>{hit.detail}</small>
                  </button>
                )
              })}
            </div>
          ))}
          {!flat.length ? <p className="empty">{loading ? 'Searching…' : `Nothing matches “${q.trim()}”.`}</p> : null}
        </div>
      ) : null}
    </div>
  )
}
