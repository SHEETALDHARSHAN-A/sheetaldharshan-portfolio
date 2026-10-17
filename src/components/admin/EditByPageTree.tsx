'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export type Leaf = { label: string; href: string }
export type Branch = { label: string; view?: string; items: Leaf[] }

const KEY = 'admin:edit-by-page:open'
const DEFAULT_OPEN = 4

/** The current page's link: an exact match, or the longest link it sits under (a project inside "All projects"). */
function activeHref(tree: Branch[], path: string): string | undefined {
  const hrefs = tree.flatMap((b) => b.items.map((i) => i.href))
  if (hrefs.includes(path)) return path
  return hrefs.filter((h) => path.startsWith(`${h}/`)).sort((a, b) => b.length - a.length)[0]
}

/**
 * The "Edit by page" menu. The admin re-renders the menu on every page, so which groups are open is
 * remembered in the browser; the group holding the current page always opens, and that page is marked.
 */
export function EditByPageTree({ tree }: { tree: Branch[] }) {
  const path = usePathname() ?? ''
  const active = activeHref(tree, path)
  const [open, setOpen] = useState<Set<string>>(() => new Set(tree.slice(0, DEFAULT_OPEN).map((b) => b.label)))

  // Restore what was open last time (after hydration, so server and client render the same first).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(KEY)
      if (saved) setOpen(new Set(JSON.parse(saved) as string[]))
    } catch {
      /* storage blocked: keep the defaults */
    }
  }, [])

  const remember = (next: Set<string>) => {
    setOpen(next)
    try {
      window.localStorage.setItem(KEY, JSON.stringify([...next]))
    } catch {
      /* storage blocked */
    }
  }

  return (
    <nav className="edit-by-page" aria-label="Edit by page">
      <style>{`
        .edit-by-page { margin: 0 0 18px; padding-bottom: 14px; border-bottom: 1px solid var(--theme-elevation-100); }
        .edit-by-page > p { margin: 0 0 8px; font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--theme-elevation-500); }
        .edit-by-page details { margin: 0 0 2px; }
        .edit-by-page summary { display: flex; align-items: center; gap: 6px; padding: 5px 0; cursor: pointer; font-weight: 600; color: var(--theme-elevation-800); list-style: none; }
        .edit-by-page summary::-webkit-details-marker { display: none; }
        .edit-by-page summary::before { content: '▸'; font-size: 10px; color: var(--theme-elevation-400); transition: transform .15s ease; }
        .edit-by-page details[open] > summary::before { transform: rotate(90deg); }
        .edit-by-page summary a.view { margin-left: auto; font-size: 11px; font-weight: 400; color: var(--theme-elevation-500); text-decoration: none; }
        .edit-by-page summary a.view:hover { color: var(--theme-success-500, #3d8bff); }
        .edit-by-page ul { list-style: none; margin: 0 0 6px; padding: 0 0 0 14px; border-left: 1px solid var(--theme-elevation-100); }
        .edit-by-page li a { display: block; padding: 3px 0 3px 8px; font-size: 13px; color: var(--theme-elevation-650); text-decoration: none; border-radius: 4px; }
        .edit-by-page li a:hover { color: var(--theme-elevation-1000); background: var(--theme-elevation-50); }
        .edit-by-page li a[aria-current='page'] { color: var(--theme-elevation-1000); background: var(--theme-elevation-100); font-weight: 600; }
      `}</style>
      <p>Edit by page</p>
      {tree.map((b) => {
        const holdsActive = b.items.some((i) => i.href === active)
        return (
          <details
            key={b.label}
            open={open.has(b.label) || holdsActive}
            onToggle={(e) => {
              const isOpen = e.currentTarget.open
              if (isOpen === open.has(b.label)) return
              const next = new Set(open)
              if (isOpen) next.add(b.label)
              else next.delete(b.label)
              remember(next)
            }}
          >
            <summary>
              {b.label}
              {b.view ? (
                <a className="view" href={b.view} target="_blank" rel="noreferrer" title={`Open ${b.view} on the site`}>
                  view ↗
                </a>
              ) : null}
            </summary>
            <ul>
              {b.items.map((it) => (
                <li key={it.href + it.label}>
                  <Link href={it.href} aria-current={it.href === active ? 'page' : undefined}>
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        )
      })}
    </nav>
  )
}
