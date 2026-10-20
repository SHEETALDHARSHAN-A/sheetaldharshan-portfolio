'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AuthorLine } from './Author'
import { useReader } from './reader'
import { SignInOptions } from './SignIn'
import { StarIcon } from './StarButton'
import { Time } from './Time'
import { listActions, listError, useLists } from './lists'

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
  ['mine', 'Your channels'],
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
  const lists = useLists(reader?.id)
  const [newName, setNewName] = useState('')
  const [listErr, setListErr] = useState('')

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
          <h1 className="h1-accent">Your ./stdout</h1>
          <p>Sign in to see the channels you starred and everything you wrote, liked and reported.</p>
        </header>
        <SignInOptions why="to see your page" />
      </div>
    )

  const counts: Record<Tab, number> = { mine: lists.length, comments: data?.comments.length ?? 0, starred: data?.starred.length ?? 0, reviews: data?.reviews.length ?? 0, liked: data?.liked.length ?? 0, reports: data?.reports.length ?? 0 }
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
      ) : tab === 'mine' ? (
        <div className="kb-me">
          {lists.length ? (
            <ul className="kb-me-list">
              {lists.map((l) => (
                <li key={l.id}>
                  <p className="kb-me-body">
                    <Link href={`/notes/saved/${l.id}`}>
                      {l.emoji || '◆'} {l.name}
                    </Link>
                  </p>
                  <p className="kb-me-meta">
                    {l.count} saved post{l.count === 1 ? '' : 's'}
                    {l.description ? ` · ${l.description}` : ''} · private
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            empty('Make channels of your own and save posts into them with the Save button on any post.')
          )}
          <form
            className="kb-form-row"
            onSubmit={async (e) => {
              e.preventDefault()
              const r = await listActions.create(newName)
              if (!r.ok) return setListErr(listError(r))
              setNewName('')
              setListErr('')
            }}
          >
            <input value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={60} placeholder="New channel, e.g. Read later" aria-label="New channel name" />
            <button type="submit" className="btn" disabled={!newName.trim()}>
              Create channel
            </button>
          </form>
          {listErr ? <p className="kb-error">{listErr}</p> : null}
        </div>
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
      <YourData />
    </div>
  )
}

/** Download everything stored about you, or delete your account. */
function YourData() {
  const [confirming, setConfirming] = useState(false)
  const [comments, setComments] = useState<'delete' | 'anonymous'>('delete')
  const [state, setState] = useState<{ busy?: boolean; error?: string }>({})
  return (
    <section className="kb-data" aria-label="Your data">
      <p className="kb-sec-title">Your data</p>
      <p className="kb-note">
        See what is stored and why in the <Link href="/privacy">privacy notice</Link>.
      </p>
      <div className="kb-inline-actions">
        <a className="btn ghost" href="/api/kb/my-data" download>
          Download my data
        </a>
        {!confirming ? (
          <button type="button" className="btn ghost kb-danger" onClick={() => setConfirming(true)}>
            Delete my account
          </button>
        ) : null}
      </div>
      {confirming ? (
        <div className="kb-delete">
          <p>
            <strong>Delete your account?</strong> Your likes, stars, ratings and reports are removed and you are signed out everywhere. This cannot be undone.
          </p>
          <label className="kb-reason" data-on={comments === 'delete' || undefined}>
            <input type="radio" name="kb-del" checked={comments === 'delete'} onChange={() => setComments('delete')} />
            Delete my comments too (ones with replies show as &quot;deleted&quot;)
          </label>
          <label className="kb-reason" data-on={comments === 'anonymous' || undefined}>
            <input type="radio" name="kb-del" checked={comments === 'anonymous'} onChange={() => setComments('anonymous')} />
            Keep my comments, shown as Anonymous
          </label>
          {state.error ? <p className="kb-error">{state.error}</p> : null}
          <div className="kb-inline-actions">
            <button type="button" className="btn ghost" onClick={() => setConfirming(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn kb-danger-solid"
              disabled={state.busy}
              onClick={async () => {
                setState({ busy: true })
                const res = await fetch('/api/kb/delete-account', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comments }) }).catch(() => null)
                const body = (await res?.json().catch(() => null)) as { ok?: boolean; error?: string } | null
                if (!body?.ok) return setState({ error: body?.error ?? 'It could not be deleted. Please try again.' })
                // A full reload, so nothing from the deleted account stays in memory.
                // eslint-disable-next-line @next/next/no-location-assign-relative-destination
                window.location.assign('/notes?signin=deleted')
              }}
            >
              {state.busy ? 'Deleting…' : 'Delete my account'}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
