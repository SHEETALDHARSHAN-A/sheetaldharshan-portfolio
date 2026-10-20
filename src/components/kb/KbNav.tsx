'use client'

import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { Channel } from '@/data/types'
import { VerifiedTick } from './Author'
import { Avatar } from './Avatar'
import { KbSideResizer } from './KbSideControls'
import { listActions, listError, useLists } from './lists'
import { askToSignIn, useReader } from './reader'
import { StarIcon } from './StarButton'
import { reloadStars, useStars } from './stars'

type Child = { key: string | number; slug: string; title: string }

/** Which sections and channels are folded, kept in this browser. */
const FOLD_KEY = 'kb-fold'
function readFolds(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(FOLD_KEY) ?? '{}') as Record<string, boolean>
  } catch {
    return {}
  }
}

type Fold = { isOpen: (key: string, byDefault: boolean) => boolean; flip: (key: string, byDefault: boolean) => void }

/** A section heading that folds its contents. */
function Section({ fold, id, title, className, children }: { fold: Fold; id: string; title: string; className?: string; children: React.ReactNode }) {
  const open = fold.isOpen(`s:${id}`, true)
  return (
    <section className={`kb-side-sec${className ? ` ${className}` : ''}`} data-folded={open ? undefined : true}>
      <h2>
        <button type="button" className="kb-sec-toggle" aria-expanded={open} onClick={() => fold.flip(`s:${id}`, true)}>
          <ChevronRight aria-hidden="true" className="kb-chev" />
          {title}
        </button>
      </h2>
      <div className="kb-sec-body" hidden={!open}>
        {children}
      </div>
    </section>
  )
}

/** One parent row (a channel), with its children (posts) folded beneath it. */
function Parent({ fold, activePost, id, href, mark, label, count, current, items, after }: { fold: Fold; activePost?: string; id: string; href: string; mark: string; label: string; count: number; current: boolean; items: Child[]; after?: React.ReactNode }) {
  const open = items.length > 0 && fold.isOpen(`c:${id}`, current)
  return (
    <li className="kb-side-item" data-open={open || undefined}>
      <div className="kb-parent">
        {items.length ? (
          <button type="button" className="kb-twisty" aria-expanded={open} aria-label={`${open ? 'Fold' : 'Show'} posts in ${label}`} onClick={() => fold.flip(`c:${id}`, current)}>
            <ChevronRight aria-hidden="true" className="kb-chev" />
          </button>
        ) : (
          <span className="kb-twisty" aria-hidden="true" />
        )}
        <Link href={href} className="kb-side-row" aria-current={current ? 'page' : undefined}>
          <span className="kb-hash">{mark}</span>
          <span className="kb-side-name">{label}</span>
          <span className="kb-side-count">{count}</span>
        </Link>
        {after}
      </div>
      {open ? (
        <ul className="kb-children">
          {items.map((p) => (
            <li key={p.key}>
              <Link href={`/notes/${p.slug}`} className="kb-child" aria-current={activePost === p.slug ? 'page' : undefined}>
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  )
}

/**
 * The right-hand column on ./stdout pages, as a tree: sections (Browse, Your channels, Channels,
 * You) fold open and shut, and each channel opens to list its posts, like folders and files. The
 * channel you're in opens by itself, with the current post marked. On narrower screens the column
 * turns into search plus a row of channel chips (the tree is folded away there).
 */
export function KbNav({ channels, active, activePost, query, stars = true, signIn = true }: { channels: Channel[]; active?: string; activePost?: string; query?: string; stars?: boolean; signIn?: boolean }) {
  const { counts, mine, toggle } = useStars()
  const { reader, ready, signOut } = useReader()
  const lists = useLists(reader?.id)
  const chips = useRef<HTMLDivElement>(null)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [listErr, setListErr] = useState('')
  // Sections are open unless folded; channels are folded unless opened (or current).
  const [folds, setFolds] = useState<Record<string, boolean>>({})
  useEffect(() => setFolds(readFolds()), [])
  const isOpen = (key: string, byDefault: boolean) => folds[key] ?? byDefault
  const flip = (key: string, byDefault: boolean) => {
    const next = { ...folds, [key]: !isOpen(key, byDefault) }
    setFolds(next)
    try {
      localStorage.setItem(FOLD_KEY, JSON.stringify(next))
    } catch {
      /* storage blocked */
    }
  }

  const fold: Fold = { isOpen, flip }

  // Stars are per reader: refresh them when someone signs in or out.
  useEffect(() => {
    if (ready) void reloadStars()
  }, [ready, reader?.id])

  // As a sideways row of chips (narrower screens), bring the current channel into view.
  useEffect(() => {
    const id = window.setTimeout(() => {
      const el = chips.current
      const current = el?.querySelector<HTMLElement>('.kb-side-row[aria-current="page"]')
      if (!el || !current || el.scrollWidth <= el.clientWidth) return
      const box = el.getBoundingClientRect()
      const r = current.getBoundingClientRect()
      el.scrollTo({ left: el.scrollLeft + r.left - box.left - box.width / 3 })
    }, 120)
    return () => window.clearTimeout(id)
  }, [active, lists.length])

  const channelRow = (c: Channel, key: string) => (
    <Parent
      fold={fold}
      activePost={activePost}
      key={key}
      id={key}
      href={`/notes/c/${c.slug}`}
      mark={c.emoji ?? '#'}
      label={c.title}
      count={c.posts}
      current={active === c.slug}
      items={c.items.map((p) => ({ key: p.slug, ...p }))}
      after={
        stars ? (
          <button type="button" className="kb-side-star" aria-pressed={mine.includes(c.id)} aria-label={`${mine.includes(c.id) ? 'Unstar' : 'Star'} #${c.title}`} title={counts[c.id] ? `${counts[c.id]} star${counts[c.id] === 1 ? '' : 's'}` : 'Star'} onClick={() => void toggle(c.id)}>
            <StarIcon on={mine.includes(c.id)} size={14} />
          </button>
        ) : null
      }
    />
  )
  const starred = channels.filter((c) => mine.includes(c.id))

  return (
    <aside className="kb-side" aria-label="./stdout channels">
      <KbSideResizer />
      <form action="/notes" method="get" role="search" className="kb-search">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <label className="sr-only" htmlFor="kb-q">
          Search ./stdout
        </label>
        <input id="kb-q" name="q" type="search" placeholder="Search notes" defaultValue={query ?? ''} />
      </form>

      <div className="kb-side-chips" ref={chips}>
        <Section fold={fold} id="browse" title="Browse">
          <ul className="kb-side-list">
            <li className="kb-side-item">
              <div className="kb-parent">
                <span className="kb-twisty" aria-hidden="true" />
                <Link href="/notes" className="kb-side-row" aria-current={active === 'all' ? 'page' : undefined}>
                  <span className="kb-hash">≡</span>
                  <span className="kb-side-name">All posts</span>
                </Link>
              </div>
            </li>
            {stars ? starred.map((c) => channelRow(c, `s-${c.id}`)) : null}
          </ul>
        </Section>

        {ready && signIn && reader ? (
          <Section fold={fold} id="mine" title="Your channels" className="kb-side-mine">
            <ul className="kb-side-list">
              {lists.map((l) => (
                <Parent
                  fold={fold}
                  activePost={activePost}
                  key={l.id}
                  id={`l-${l.id}`}
                  href={`/notes/saved/${l.id}`}
                  mark={l.emoji || '◆'}
                  label={l.name}
                  count={l.count}
                  current={active === `saved-${l.id}`}
                  items={(l.items ?? []).map((p) => ({ key: p.id, slug: p.slug, title: p.title }))}
                />
              ))}
            </ul>
            {adding ? (
              <form
                className="kb-side-new"
                onSubmit={async (e) => {
                  e.preventDefault()
                  const r = await listActions.create(newName)
                  if (!r.ok) return setListErr(listError(r))
                  setNewName('')
                  setAdding(false)
                  setListErr('')
                }}
              >
                <input value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={60} placeholder="Channel name" aria-label="New channel name" autoFocus />
                <button type="submit" className="kb-link" disabled={!newName.trim()}>
                  Create
                </button>
                <button type="button" className="kb-link kb-link-muted" onClick={() => setAdding(false)}>
                  Cancel
                </button>
              </form>
            ) : (
              <button type="button" className="kb-link kb-side-add" onClick={() => setAdding(true)}>
                + New channel
              </button>
            )}
            {listErr ? <p className="kb-error">{listErr}</p> : null}
            {!lists.length && !adding ? <p className="kb-side-hint">Save posts into your own channels with the Save button on any post.</p> : null}
          </Section>
        ) : null}

        {channels.length > 0 ? (
          <Section fold={fold} id="channels" title="Channels">
            <ul className="kb-side-list">{channels.map((c) => channelRow(c, `c-${c.id}`))}</ul>
          </Section>
        ) : null}
      </div>

      {ready && signIn ? (
        <Section fold={fold} id="you" title="You" className="kb-side-you">
          {reader ? (
            <div className="kb-you">
              <Avatar name={reader.name} src={reader.avatar} size={30} />
              <Link href="/notes/me" className="kb-you-name">
                {reader.name}
                {reader.verified ? <VerifiedTick size={13} /> : null}
              </Link>
              <button type="button" className="kb-link kb-link-muted" onClick={() => void signOut()}>
                Sign out
              </button>
            </div>
          ) : (
            <p className="kb-you-out">
              <button type="button" className="kb-link" onClick={() => askToSignIn()}>
                Sign in
              </button>{' '}
              to comment, like and star channels.
            </p>
          )}
        </Section>
      ) : null}
      <Link href="/privacy" className="kb-privacy">
        Privacy
      </Link>
    </aside>
  )
}
