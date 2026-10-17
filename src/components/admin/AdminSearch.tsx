'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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
  const [place, setPlace] = useState<{ left: number; top: number; width: number; maxHeight: number } | null>(null)

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
      const get = (scope: string) =>
        fetch(`/api/admin-search?scope=${scope}&q=${encodeURIComponent(term)}`, { credentials: 'include', signal: ctrl.signal })
          .then((r) => (r.ok ? r.json() : { hits: [] }))
          .then((d: { hits: AdminHit[] }) => d.hits)
      // Settings and fields answer at once; content (which needs the database) is added when it arrives.
      let settings: AdminHit[] = []
      let content: AdminHit[] = []
      const show = () => setHits([...content, ...settings])
      setActive(0)
      const a = get('settings').then((h) => {
        settings = h
        show()
      })
      const b = get('content').then((h) => {
        content = h
        show()
      })
      Promise.allSettled([a, b]).then(() => !ctrl.signal.aborted && setLoading(false))
    }, 120)
    return () => {
      window.clearTimeout(t)
      ctrl.abort()
    }
  }, [q])

  const visible = open && Boolean(q.trim())

  // The results float above the page (the admin menu would clip them), lined up under the field.
  useLayoutEffect(() => {
    if (!visible) return
    const update = () => {
      const r = inputRef.current?.getBoundingClientRect()
      if (!r) return
      const width = Math.min(window.innerWidth - 16, Math.max(r.width, 460))
      setPlace({ left: Math.max(8, Math.min(r.left, window.innerWidth - width - 8)), top: r.bottom + 6, width, maxHeight: Math.max(200, window.innerHeight - r.bottom - 24) })
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [visible])

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
    <div className="admin-search">
      <style>{`
        .admin-search { position: relative; margin: 0 0 16px; }
        .admin-search input { width: 100%; height: 36px; padding: 0 44px 0 32px; border-radius: var(--style-radius-m, 6px); border: 1px solid var(--theme-elevation-150); background: var(--theme-input-bg, var(--theme-elevation-50)); color: var(--theme-text); font: inherit; font-size: 13px; outline: none; }
        .admin-search input:focus { border-color: var(--theme-success-500); }
        .admin-search .icon { position: absolute; left: 10px; top: 10px; width: 15px; height: 15px; color: var(--theme-elevation-500); pointer-events: none; }
        .admin-search .clear { position: absolute; right: 6px; top: 6px; width: 24px; height: 24px; display: grid; place-items: center; padding: 0; border: 0; border-radius: 4px; background: transparent; color: var(--theme-elevation-500); font-size: 18px; line-height: 1; cursor: pointer; }
        .admin-search .clear:hover { color: var(--theme-text); background: var(--theme-elevation-100); }
        .admin-search kbd { position: absolute; right: 8px; top: 8px; padding: 1px 6px; border-radius: 4px; border: 1px solid var(--theme-elevation-150); font: 11px/18px inherit; color: var(--theme-elevation-500); pointer-events: none; }
        .admin-search input::-webkit-search-cancel-button { -webkit-appearance: none; }
        .admin-search-panel { position: fixed; z-index: 1000; overflow-y: auto; padding: 6px; border-radius: var(--style-radius-m, 8px); border: 1px solid var(--theme-elevation-150); background: var(--theme-bg); box-shadow: 0 16px 40px rgba(0,0,0,.35); }
        .admin-search-panel .group { margin: 8px 8px 4px; font-size: 10.5px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--theme-elevation-500); }
        .admin-search-panel button { display: grid; gap: 1px; width: 100%; padding: 7px 10px; border: 0; border-radius: 6px; background: transparent; color: var(--theme-text); font: inherit; text-align: left; cursor: pointer; }
        .admin-search-panel button[aria-selected='true'] { background: var(--theme-elevation-100); }
        .admin-search-panel button span { font-size: 13px; }
        .admin-search-panel button small { font-size: 11.5px; color: var(--theme-elevation-500); overflow-wrap: anywhere; }
        .admin-search-panel .empty { margin: 10px; font-size: 13px; color: var(--theme-elevation-500); }
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
        onBlur={() => setOpen(false)}
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
      {q ? (
        <button type="button" className="clear" aria-label="Clear search" onClick={() => { setQ(''); inputRef.current?.focus() }}>
          ×
        </button>
      ) : (
        <kbd>⌘K</kbd>
      )}
      {visible && place ? createPortal(
        <div
          className="admin-search-panel"
          id="admin-search-results"
          role="listbox"
          style={place}
          // Clicking a result must not blur the field first, or the panel would close before the click lands.
          onMouseDown={(e) => e.preventDefault()}
        >
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
          {!flat.length ? <p className="empty">{loading ? 'Searching…' : `Nothing matches “${q.trim()}”.`}</p> : loading ? <p className="empty">Looking through content…</p> : null}
        </div>,
        document.body,
      ) : null}
    </div>
  )
}
