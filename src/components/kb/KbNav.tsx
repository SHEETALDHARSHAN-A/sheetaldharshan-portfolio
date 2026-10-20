'use client'

import Link from 'next/link'
import type { Channel } from '@/data/types'
import { StarIcon } from './StarButton'
import { useStars } from './stars'

const mark = (c: Pick<Channel, 'emoji'>) => (c.emoji ? <span className="kb-emoji">{c.emoji}</span> : <span className="kb-hash">#</span>)

/**
 * The Field Notes sidebar, like Slack's: search, all posts, the channels you starred, then every
 * channel with its post count. On phones it becomes a row of channel chips above the posts.
 */
export function KbNav({ channels, active, query }: { channels: Channel[]; active?: string; query?: string }) {
  const { counts, mine, toggle } = useStars()
  const starred = channels.filter((c) => mine.includes(c.id))
  const row = (c: Channel, inStarred = false) => (
    <li key={`${inStarred ? 's' : 'c'}-${c.id}`}>
      <Link href={`/notes/c/${c.slug}`} className="kb-nav-item" aria-current={active === c.slug ? 'page' : undefined}>
        {mark(c)}
        <span className="kb-nav-name">{c.title}</span>
        <span className="kb-nav-count">{c.posts}</span>
      </Link>
      <button type="button" className="kb-nav-star" aria-pressed={mine.includes(c.id)} aria-label={`${mine.includes(c.id) ? 'Unstar' : 'Star'} #${c.title}`} onClick={() => void toggle(c.id)} title={counts[c.id] ? `${counts[c.id]} star${counts[c.id] === 1 ? '' : 's'}` : 'Star'}>
        <StarIcon on={mine.includes(c.id)} size={13} />
      </button>
    </li>
  )
  return (
    <nav className="kb-nav" aria-label="Field Notes channels">
      <form action="/notes" method="get" role="search" className="kb-search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <label className="sr-only" htmlFor="kb-q">
          Search the Field Notes
        </label>
        <input id="kb-q" name="q" type="search" placeholder="Search" defaultValue={query ?? ''} />
      </form>
      <ul className="kb-nav-list">
        <li>
          <Link href="/notes" className="kb-nav-item" aria-current={active === 'all' ? 'page' : undefined}>
            <span className="kb-hash">≡</span>
            <span className="kb-nav-name">All posts</span>
          </Link>
        </li>
      </ul>
      {starred.length > 0 && (
        <>
          <p className="kb-nav-head">Starred</p>
          <ul className="kb-nav-list">{starred.map((c) => row(c, true))}</ul>
        </>
      )}
      {channels.length > 0 && (
        <>
          <p className="kb-nav-head">Channels</p>
          <ul className="kb-nav-list">{channels.map((c) => row(c))}</ul>
        </>
      )}
    </nav>
  )
}
