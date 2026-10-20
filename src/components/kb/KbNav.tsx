'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import type { Channel } from '@/data/types'
import { Avatar } from './Avatar'
import { KbSideResizer } from './KbSideControls'
import { VerifiedTick } from './Author'
import { askToSignIn, useReader } from './reader'
import { StarIcon } from './StarButton'
import { reloadStars, useStars } from './stars'
import { listActions, listError, useLists } from './lists'
import { useState } from 'react'

/**
 * The right-hand column on ./stdout pages, styled like the Contact page's: search, all posts, the
 * channels you starred, every channel, and who you are. On phones it becomes a row of chips
 * above the posts.
 */
export function KbNav({
  channels,
  active,
  query,
  stars = true,
  signIn = true,
}: {
  channels: Channel[]
  active?: string
  query?: string
  stars?: boolean
  signIn?: boolean
}) {
  const { counts, mine, toggle } = useStars()
  const { reader, ready, signOut } = useReader()
  // Stars are per reader: refresh them when someone signs in or out.
  useEffect(() => {
    if (ready) void reloadStars()
  }, [ready, reader?.id])

  const lists = useLists(reader?.id)
  const chips = useRef<HTMLDivElement>(null)
  // When the column is a sideways-scrolling row (narrower screens), bring the current channel into view.
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
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [listErr, setListErr] = useState('')
  const starred = channels.filter((c) => mine.includes(c.id))
  const row = (c: Channel, key: string) => (
    <li key={key} className="kb-side-item">
      <Link
        href={`/notes/c/${c.slug}`}
        className="kb-side-row"
        aria-current={active === c.slug ? 'page' : undefined}
      >
        <span className="kb-hash">{c.emoji ?? '#'}</span>
        <span className="kb-side-name">{c.title}</span>
        <span className="kb-side-count">{c.posts}</span>
      </Link>
      {stars ? (
        <button
          type="button"
          className="kb-side-star"
          aria-pressed={mine.includes(c.id)}
          aria-label={`${mine.includes(c.id) ? 'Unstar' : 'Star'} #${c.title}`}
          title={counts[c.id] ? `${counts[c.id]} star${counts[c.id] === 1 ? '' : 's'}` : 'Star'}
          onClick={() => void toggle(c.id)}
        >
          <StarIcon on={mine.includes(c.id)} size={14} />
        </button>
      ) : null}
    </li>
  )

  return (
    <>
      <aside className="kb-side" aria-label="./stdout channels">
        <KbSideResizer />
        <form action="/notes" method="get" role="search" className="kb-search">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <label className="sr-only" htmlFor="kb-q">
            Search ./stdout
          </label>
          <input
            id="kb-q"
            name="q"
            type="search"
            placeholder="Search notes"
            defaultValue={query ?? ''}
          />
        </form>

        <div className="kb-side-chips" ref={chips}>
          <section className="kb-side-sec">
            <h2>Browse</h2>
            <ul className="kb-side-list">
              <li className="kb-side-item">
                <Link
                  href="/notes"
                  className="kb-side-row"
                  aria-current={active === 'all' ? 'page' : undefined}
                >
                  <span className="kb-hash">≡</span>
                  <span className="kb-side-name">All posts</span>
                </Link>
              </li>
              {stars ? starred.map((c) => row(c, `s-${c.id}`)) : null}
            </ul>
          </section>

          {ready && signIn && reader ? (
            <section className="kb-side-sec kb-side-mine">
              <h2>Your channels</h2>
              <ul className="kb-side-list">
                {lists.map((l) => (
                  <li key={l.id} className="kb-side-item">
                    <Link
                      href={`/notes/saved/${l.id}`}
                      className="kb-side-row"
                      aria-current={active === `saved-${l.id}` ? 'page' : undefined}
                    >
                      <span className="kb-hash">{l.emoji || '◆'}</span>
                      <span className="kb-side-name">{l.name}</span>
                      <span className="kb-side-count">{l.count}</span>
                    </Link>
                  </li>
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
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    maxLength={60}
                    placeholder="Channel name"
                    aria-label="New channel name"
                    autoFocus
                  />
                  <button type="submit" className="kb-link" disabled={!newName.trim()}>
                    Create
                  </button>
                  <button
                    type="button"
                    className="kb-link kb-link-muted"
                    onClick={() => setAdding(false)}
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  className="kb-link kb-side-add"
                  onClick={() => setAdding(true)}
                >
                  + New channel
                </button>
              )}
              {listErr ? <p className="kb-error">{listErr}</p> : null}
              {!lists.length && !adding ? (
                <p className="kb-side-hint">
                  Save posts into your own channels with the Save button on any post.
                </p>
              ) : null}
            </section>
          ) : null}

          {channels.length > 0 ? (
            <section className="kb-side-sec">
              <h2>Channels</h2>
              <ul className="kb-side-list">{channels.map((c) => row(c, `c-${c.id}`))}</ul>
            </section>
          ) : null}
        </div>

        {ready && signIn ? (
          <section className="kb-side-sec kb-side-you">
            <h2>You</h2>
            {reader ? (
              <div className="kb-you">
                <Avatar name={reader.name} src={reader.avatar} size={30} />
                <Link href="/notes/me" className="kb-you-name">
                  {reader.name}
                  {reader.verified ? <VerifiedTick size={13} /> : null}
                </Link>
                <button
                  type="button"
                  className="kb-link kb-link-muted"
                  onClick={() => void signOut()}
                >
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
          </section>
        ) : null}
        <Link href="/privacy" className="kb-privacy">
          Privacy
        </Link>
      </aside>
    </>
  )
}
