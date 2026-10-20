'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AuthorLine } from './Author'
import { useReader } from './reader'
import { SignInOptions } from './SignIn'
import { StarIcon } from './StarButton'
import { Time } from './Time'

type PostRef = { title: string; slug: string } | null
type Mine = {
  starred: { id: number; title: string; slug: string; emoji?: string }[]
  comments: { id: number; body: string; status: string; likes: number; createdAt: string; editedAt: string | null; post: PostRef }[]
  reviews: { id: number; rating: number; review: string; status: string; createdAt: string; post: PostRef }[]
  liked: { id: number; body: string; author: string; createdAt: string; post: PostRef }[]
  reports: { id: number; reason: string; status: string; quote?: string; createdAt: string; updatedAt: string; post: PostRef }[]
}

const STATUS: Record<string, string> = { published: 'Live', pending: 'Waiting for approval', hidden: 'Hidden by the author', open: 'Open, being looked at', actioned: 'Done: the comment was removed', dismissed: 'Reviewed: the comment stays' }
const REASON: Record<string, string> = { spam: 'Spam', abuse: 'Abuse', hate: 'Hate', misleading: 'Misleading', 'off-topic': 'Off-topic', other: 'Other' }
const TABS = [
  ['comments', 'Comments'],
  ['starred', 'Starred channels'],
  ['reviews', 'Ratings'],
  ['liked', 'Liked'],
  ['reports', 'Reports'],
] as const
type Tab = (typeof TABS)[number][0]

const clip = (s: string, n = 180) => (s.length > n ? `${s.slice(0, n - 1)}…` : s)
const PostLink = ({ post, hash }: { post: PostRef; hash?: string }) => (post?.slug ? <Link href={`/notes/${post.slug}${hash ?? ''}`}>{post.title}</Link> : <span>A removed post</span>)

/** A signed-in reader's own page: what they starred, wrote, rated, liked and reported. */
export function MyNotes() {
  const { reader, ready, signOut } = useReader()
  const [data, setData] = useState<Mine | null>(null)
  const [tab, setTab] = useState<Tab>('comments')

  useEffect(() => {
    if (!reader) return
    fetch('/api/kb/my', { credentials: 'include', cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Mine | null) => d && setData(d))
      .catch(() => undefined)
  }, [reader])

  if (!ready) return <div className="kb-loading" aria-busy="true" />
  if (!reader)
    return (
      <div className="kb-me">
        <header className="page-head kb-head">
          <h1 className="h1-accent">Your Field Notes</h1>
          <p>Sign in to see the channels you starred and everything you wrote, liked and reported.</p>
        </header>
        <SignInOptions why="to see your page" />
      </div>
    )

  const counts: Record<Tab, number> = { comments: data?.comments.length ?? 0, starred: data?.starred.length ?? 0, reviews: data?.reviews.length ?? 0, liked: data?.liked.length ?? 0, reports: data?.reports.length ?? 0 }
  const empty = (text: string) => <p className="kb-empty-c">{text}</p>
  return (
    <div className="kb-me">
      <header className="kb-me-head">
        <div className="kb-me-who">
          <AuthorLine author={{ name: reader.name, avatar: reader.avatar, verified: reader.verified, github: reader.github }} size={56} />
        </div>
        <p className="kb-note">
          {reader.verified ? `Verified with GitHub${reader.github ? ` as @${reader.github}` : ''}.` : 'Signed in with an email link.'}{' '}
          <button type="button" className="kb-link kb-link-muted" onClick={() => void signOut()}>
            Sign out
          </button>
        </p>
      </header>
      <div className="kb-seg kb-me-tabs" role="tablist" aria-label="Your activity">
        {TABS.map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>
            {label} <b>{counts[k]}</b>
          </button>
        ))}
      </div>
      {!data ? (
        <div className="kb-loading" aria-busy="true" />
      ) : tab === 'comments' ? (
        data.comments.length ? (
          <ul className="kb-me-list">
            {data.comments.map((c) => (
              <li key={c.id}>
                <p className="kb-me-body">{clip(c.body)}</p>
                <p className="kb-me-meta">
                  on <PostLink post={c.post} hash={`#comment-${c.id}`} /> · <Time iso={c.createdAt} edited={c.editedAt} /> · {c.likes} like{c.likes === 1 ? '' : 's'} · <span data-status={c.status}>{STATUS[c.status] ?? c.status}</span>
                </p>
              </li>
            ))}
          </ul>
        ) : (
          empty('You have not commented yet.')
        )
      ) : tab === 'starred' ? (
        data.starred.length ? (
          <ul className="kb-me-chips">
            {data.starred.map((c) => (
              <li key={c.id}>
                <Link href={`/notes/c/${c.slug}`} className="kb-chip">
                  <StarIcon on size={12} /> {c.emoji ?? '#'} {c.title}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          empty('Star channels from the sidebar to keep them here.')
        )
      ) : tab === 'reviews' ? (
        data.reviews.length ? (
          <ul className="kb-me-list">
            {data.reviews.map((r) => (
              <li key={r.id}>
                <p className="kb-me-body">
                  <span className="kb-stars">{'★'.repeat(r.rating)}</span>
                  <span className="kb-faint">{'★'.repeat(5 - r.rating)}</span> {r.review ? clip(r.review) : null}
                </p>
                <p className="kb-me-meta">
                  <PostLink post={r.post} hash="#discussion" /> · <Time iso={r.createdAt} /> · <span data-status={r.status}>{STATUS[r.status] ?? r.status}</span>
                </p>
              </li>
            ))}
          </ul>
        ) : (
          empty('You have not rated any posts yet.')
        )
      ) : tab === 'liked' ? (
        data.liked.length ? (
          <ul className="kb-me-list">
            {data.liked.map((c) => (
              <li key={c.id}>
                <p className="kb-me-body">“{clip(c.body)}”</p>
                <p className="kb-me-meta">
                  {c.author} on <PostLink post={c.post} hash={`#comment-${c.id}`} /> · <Time iso={c.createdAt} />
                </p>
              </li>
            ))}
          </ul>
        ) : (
          empty('Comments you like show up here.')
        )
      ) : data.reports.length ? (
        <ul className="kb-me-list">
          {data.reports.map((r) => (
            <li key={r.id}>
              <p className="kb-me-body">{r.quote ? `“${clip(r.quote)}”` : 'A comment'}</p>
              <p className="kb-me-meta">
                {REASON[r.reason] ?? r.reason} · <PostLink post={r.post} /> · reported <Time iso={r.createdAt} /> · <span data-status={r.status}>{STATUS[r.status] ?? r.status}</span>
              </p>
            </li>
          ))}
        </ul>
      ) : (
        empty('Comments you report, and what happened to them, show up here.')
      )}
    </div>
  )
}
