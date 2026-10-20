'use client'

import { confirmAction } from './Confirm'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AuthorLine, VerifiedTick, type Author } from './Author'
import { Avatar } from './Avatar'
import { askToSignIn, setReader, useReader, type Reader } from './reader'
import { ReportDialog } from './Report'
import { SignInOptions } from './SignIn'
import { StarIcon } from './StarButton'
import { Time } from './Time'

type Comment = { id: number; parent: number | null; author: Author; body: string; deleted: boolean; likes: number; liked: boolean; pending: boolean; mine: boolean; createdAt: string; editedAt: string | null }
type Review = { id: number; author: Author; rating: number; review?: string; pending: boolean; mine: boolean; createdAt: string; editedAt: string | null }
type Thread = {
  reader: Reader | null
  settings: { comments: 'on' | 'locked' | 'off'; anonymous: boolean; likes: boolean; ratings: boolean; feedback: boolean; reports: boolean; signIn: boolean }
  comments: Comment[]
  reviews: { count: number; average: number; items: Review[]; mine: { rating: number; review: string; pending: boolean } | null }
}
type Result = { ok?: boolean; pending?: boolean; error?: string; errors?: Record<string, string>; signIn?: boolean; comment?: Comment | null; liked?: boolean; likes?: number; body?: string; editedAt?: string; kept?: boolean; reader?: Reader }

const api = async (path: string, body: object): Promise<Result> => {
  const res = await fetch(`/api/kb/${path}`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).catch(() => null)
  return ((await res?.json().catch(() => null)) ?? { error: 'Could not reach the server. Please try again.' }) as Result
}
const firstError = (b: Result) => (b.errors ? Object.values(b.errors)[0] : b.error) ?? 'Something went wrong.'

/** Ratings, reviews and threaded comments under a post, loaded fresh for each reader. */
export function Discussion({ postId }: { postId: string }) {
  const { reader, ready } = useReader()
  const [thread, setThread] = useState<Thread | null>(null)
  const [failed, setFailed] = useState(false)

  const load = useCallback(async () => {
    const t = (await fetch(`/api/kb/thread?post=${postId}`, { credentials: 'include', cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)) as Thread | null
    if (t) setThread(t)
    else setFailed(true)
  }, [postId])

  // Again whenever someone signs in or out: what is "mine", liked and pending changes.
  useEffect(() => {
    if (ready) void load()
  }, [ready, reader?.id, load])

  if (failed) return null
  if (!thread) return <div className="kb-discussion kb-loading" aria-busy="true" />
  const { settings } = thread
  if (settings.comments === 'off' && !settings.ratings) return null
  return (
    <section className="kb-discussion" id="discussion" aria-label="Ratings and comments">
      {settings.ratings ? <Ratings postId={postId} thread={thread} reload={load} /> : null}
      {settings.comments !== 'off' ? <Comments postId={postId} thread={thread} setThread={setThread} reload={load} /> : null}
    </section>
  )
}

/* ------------------------------------------------------------------ ratings */

function Stars({ value, onPick, size = 22 }: { value: number; onPick?: (n: number) => void; size?: number }) {
  const [hover, setHover] = useState(0)
  const shown = hover || value
  if (!onPick)
    return (
      <span className="kb-stars" aria-label={`${value} out of 5`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <StarIcon key={n} on={n <= Math.round(value)} size={size} />
        ))}
      </span>
    )
  return (
    <span className="kb-stars kb-stars-pick" role="radiogroup" aria-label="Your rating" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} star${n === 1 ? '' : 's'}`} onMouseEnter={() => setHover(n)} onFocus={() => setHover(n)} onBlur={() => setHover(0)} onClick={() => onPick(n)}>
          <StarIcon on={n <= shown} size={size} />
        </button>
      ))}
    </span>
  )
}

const WORDS = ['', 'Not useful', 'Could be better', 'Okay', 'Useful', 'Really useful']

function Ratings({ postId, thread, reload }: { postId: string; thread: Thread; reload: () => Promise<void> }) {
  const mine = thread.reviews.mine
  const signedIn = Boolean(thread.reader)
  const [rating, setRating] = useState(mine?.rating ?? 0)
  const [writing, setWriting] = useState(false)
  const [review, setReview] = useState(mine?.review ?? '')
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null)
  useEffect(() => {
    setRating(mine?.rating ?? 0)
    setReview(mine?.review ?? '')
  }, [mine?.rating, mine?.review])

  const save = async (n: number, withReview: boolean) => {
    if (!signedIn) return askToSignIn('to rate posts')
    setRating(n)
    const body = await api('review', { post: postId, rating: n, review: withReview ? review : mine?.review ?? '' })
    if (!body.ok) return setMsg({ text: firstError(body), error: true })
    await reload()
    if (withReview) setWriting(false)
    setMsg({ text: body.pending ? 'Thanks! Your review will show once it is approved.' : withReview ? 'Thanks for the review!' : 'Thanks for rating!' })
  }
  const remove = async () => {
    const body = await api('review-delete', { post: postId })
    if (!body.ok) return setMsg({ text: firstError(body), error: true })
    setRating(0)
    setReview('')
    setWriting(false)
    await reload()
    setMsg({ text: 'Your rating was removed.' })
  }

  const { count, average, items } = thread.reviews
  return (
    <div className="kb-ratings">
      <div className="kb-rate-row">
        <div>
          <p className="kb-sec-title">Was this useful?</p>
          <div className="kb-rate-pick">
            <Stars value={rating} onPick={(n) => void save(n, false)} />
            <span className="kb-rate-word">{WORDS[rating] ?? ''}</span>
          </div>
        </div>
        {count > 0 ? (
          <div className="kb-rate-avg" title={`${count} rating${count === 1 ? '' : 's'}`}>
            <b>{average.toFixed(1)}</b>
            <Stars value={average} size={14} />
            <span>
              {count} rating{count === 1 ? '' : 's'}
            </span>
          </div>
        ) : null}
      </div>
      {signedIn && rating > 0 && !writing ? (
        <div className="kb-inline-actions">
          <button type="button" className="kb-link" onClick={() => setWriting(true)}>
            {mine?.review ? 'Edit your review' : 'Add a short review (optional)'}
          </button>
          {mine ? (
            <button type="button" className="kb-link kb-link-muted" onClick={() => void remove()}>
              Remove my rating
            </button>
          ) : null}
        </div>
      ) : null}
      {!signedIn ? <p className="kb-note">Sign in to rate. Each person rates once, so the score stays fair.</p> : null}
      {writing ? (
        <form
          className="kb-form"
          onSubmit={(e) => {
            e.preventDefault()
            void save(rating, true)
          }}
        >
          <textarea value={review} onChange={(e) => setReview(e.target.value)} rows={3} maxLength={1000} placeholder="What did you like, or what was missing?" autoFocus />
          <div className="kb-form-row kb-form-end">
            <button type="button" className="btn ghost" onClick={() => setWriting(false)}>
              Cancel
            </button>
            <button type="submit" className="btn">
              Post review
            </button>
          </div>
        </form>
      ) : null}
      {msg ? <p className={msg.error ? 'kb-error' : 'kb-note'}>{msg.text}</p> : null}
      {items.length > 0 ? (
        <ul className="kb-reviews">
          {items.map((r) => (
            <li key={r.id}>
              <div className="kb-c-head">
                <AuthorLine author={r.author} />
                <Stars value={r.rating} size={12} />
                <Time iso={r.createdAt} edited={r.editedAt} />
                {r.pending ? <span className="kb-badge">Waiting for approval</span> : null}
              </div>
              <p>{r.review}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

/* ------------------------------------------------------------------ comments */

/** Who you are commenting as, with a way to change your name or sign out. */
function Identity({ reader }: { reader: Reader | null }) {
  const { signOut } = useReader()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(reader?.name ?? '')
  const [error, setError] = useState('')
  if (!reader)
    return (
      <p className="kb-identity">
        Commenting as <strong>Anonymous</strong>.{' '}
        <button type="button" className="kb-link" onClick={() => askToSignIn('to use your name, edit your comments, like and rate')}>
          Sign in
        </button>{' '}
        to use your name and edit or delete what you write.
      </p>
    )
  if (editing)
    return (
      <form
        className="kb-identity kb-form-row"
        onSubmit={async (e) => {
          e.preventDefault()
          const body = await api('profile', { name })
          if (!body.ok || !body.reader) return setError(firstError(body))
          setReader(body.reader)
          setEditing(false)
          setError('')
        }}
      >
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} aria-label="Your name" autoFocus />
        <button type="submit" className="btn">
          Save
        </button>
        <button type="button" className="btn ghost" onClick={() => setEditing(false)}>
          Cancel
        </button>
        {error ? <p className="kb-error">{error}</p> : null}
      </form>
    )
  return (
    <p className="kb-identity">
      <Avatar name={reader.name} src={reader.avatar} size={22} />
      Commenting as <strong>{reader.name}</strong>
      {reader.verified ? <VerifiedTick size={14} /> : null}
      <span className="kb-dot">·</span>
      <button type="button" className="kb-link" onClick={() => setEditing(true)}>
        Change name
      </button>
      <span className="kb-dot">·</span>
      <button type="button" className="kb-link kb-link-muted" onClick={() => void signOut()}>
        Sign out
      </button>
    </p>
  )
}

function CommentForm({ postId, parent, onDone, onCancel, compact, initial, submit }: { postId: string; parent?: number; onDone: (r: Result) => void; onCancel?: () => void; compact?: boolean; initial?: string; submit?: (text: string) => Promise<Result> }) {
  const [text, setText] = useState(initial ?? '')
  const [state, setState] = useState<{ busy?: boolean; error?: string }>({})
  const startedAt = useRef(0)
  const website = useRef<HTMLInputElement>(null)
  useEffect(() => {
    startedAt.current = Date.now()
  }, [])
  const label = submit ? 'Save' : parent ? 'Reply' : 'Comment'
  return (
    <form
      className={`kb-form${compact ? ' kb-form-reply' : ''}`}
      onSubmit={async (e) => {
        e.preventDefault()
        setState({ busy: true })
        const body = submit ? await submit(text) : await api('comment', { post: postId, parent, body: text, website: website.current?.value ?? '', startedAt: startedAt.current })
        if (!body.ok) return setState({ error: firstError(body) })
        if (!submit) setText('')
        setState({})
        onDone(body)
      }}
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={compact ? 2 : 3}
        maxLength={2000}
        required
        placeholder={parent ? 'Write a reply…' : 'Share a thought, a question or a tip…'}
        autoFocus={compact}
        aria-label={submit ? 'Edit your comment' : parent ? 'Your reply' : 'Your comment'}
        onKeyDown={(e) => {
          // Ctrl/Cmd+Enter sends, like most comment boxes.
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) e.currentTarget.form?.requestSubmit()
        }}
      />
      <input ref={website} type="text" name="website" tabIndex={-1} autoComplete="off" className="kb-hp" aria-hidden="true" />
      <div className="kb-form-row kb-form-end">
        {onCancel ? (
          <button type="button" className="btn ghost" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
        <button type="submit" className="btn" disabled={state.busy || !text.trim()}>
          {state.busy ? 'Posting…' : label}
        </button>
      </div>
      {state.error ? <p className="kb-error">{state.error}</p> : null}
    </form>
  )
}

const MAX_DEPTH = 4

function Comments({ postId, thread, setThread, reload }: { postId: string; thread: Thread; setThread: (t: Thread) => void; reload: () => Promise<void> }) {
  const [sort, setSort] = useState<'top' | 'new' | 'old'>('top')
  const [replying, setReplying] = useState<number | null>(null)
  const [editing, setEditing] = useState<number | null>(null)
  const [reporting, setReporting] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const all = thread.comments
  const reader = thread.reader
  const { settings } = thread
  // Who may write here: comments open, and either signed in or anonymous comments allowed.
  const canWrite = settings.comments === 'on' && (Boolean(reader) || settings.anonymous)
  const byParent = new Map<number | null, Comment[]>()
  for (const c of all) {
    const key = c.parent && all.some((p) => p.id === c.parent) ? c.parent : null
    byParent.set(key, [...(byParent.get(key) ?? []), c])
  }
  const time = (c: Comment) => +new Date(c.createdAt)
  const order = (list: Comment[], top: boolean) => [...list].sort((a, b) => (top && sort === 'top' ? b.likes - a.likes || time(b) - time(a) : top && sort === 'new' ? time(b) - time(a) : time(a) - time(b)))
  const total = all.filter((c) => !c.pending && !c.deleted).length
  const patch = (id: number, p: Partial<Comment>) => setThread({ ...thread, comments: thread.comments.map((x) => (x.id === id ? { ...x, ...p } : x)) })

  const added = (r: Result) => {
    if (r.comment) setThread({ ...thread, comments: [...thread.comments, r.comment] })
    setReplying(null)
    setNote(r.pending ? 'Thanks! It will show for everyone once it is approved.' : '')
  }
  const like = async (c: Comment) => {
    if (!reader) return askToSignIn('to like comments')
    patch(c.id, { liked: !c.liked, likes: c.likes + (c.liked ? -1 : 1) })
    const body = await api('like', { comment: c.id })
    if (typeof body.likes === 'number') patch(c.id, { liked: Boolean(body.liked), likes: body.likes })
  }
  const remove = async (c: Comment) => {
    if (!(await confirmAction({ title: 'Delete your comment?', body: 'It is removed for everyone. If others replied, it shows as "deleted" so the conversation still makes sense. This cannot be undone.', confirm: 'Delete comment', danger: true, icon: 'trash' }))) return
    const body = await api('comment-delete', { id: c.id })
    if (!body.ok) return setNote(firstError(body))
    await reload()
  }

  const render = (c: Comment, depth: number): React.ReactNode => {
    const kids = order(byParent.get(c.id) ?? [], false)
    const parentName = depth >= MAX_DEPTH ? all.find((p) => p.id === c.parent)?.author.name : undefined
    return (
      <li key={c.id} className="kb-c" id={`comment-${c.id}`}>
        <div className="kb-c-card" data-pending={c.pending || undefined}>
          {c.deleted ? (
            <p className="kb-c-deleted">This comment was deleted.</p>
          ) : (
            <>
              <div className="kb-c-head">
                <AuthorLine author={c.author} />
                {parentName ? <span className="kb-c-to">↳ {parentName}</span> : null}
                <Time iso={c.createdAt} edited={c.editedAt} />
                {c.pending ? <span className="kb-badge">Waiting for approval</span> : null}
              </div>
              {editing === c.id ? (
                <CommentForm
                  postId={postId}
                  compact
                  initial={c.body}
                  submit={(text) => api('comment-edit', { id: c.id, body: text })}
                  onCancel={() => setEditing(null)}
                  onDone={(r) => {
                    if (r.body) patch(c.id, { body: r.body, editedAt: r.editedAt ?? c.editedAt, pending: Boolean(r.pending) })
                    setEditing(null)
                    if (r.pending) setNote('Your edit will show for everyone once it is approved.')
                  }}
                />
              ) : (
                <p className="kb-c-body">{c.body}</p>
              )}
              {editing !== c.id ? (
                <div className="kb-c-actions">
                  {!c.pending && thread.settings.likes ? (
                    <button type="button" aria-pressed={c.liked} onClick={() => void like(c)} className="kb-like" title={reader ? undefined : 'Sign in to like'}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={c.liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.6 4.5 7 4.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.4 0 5.6 3.4 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2Z" />
                      </svg>
                      {c.likes > 0 ? c.likes : 'Like'}
                    </button>
                  ) : null}
                  {!c.pending && canWrite ? (
                    <button type="button" onClick={() => setReplying(replying === c.id ? null : c.id)}>
                      Reply
                    </button>
                  ) : null}
                  {c.mine ? (
                    <>
                      <button type="button" onClick={() => setEditing(c.id)}>
                        Edit
                      </button>
                      <button type="button" onClick={() => void remove(c)}>
                        Delete
                      </button>
                    </>
                  ) : thread.settings.reports ? (
                    <button type="button" className="kb-report" onClick={() => setReporting(c.id)}>
                      Report
                    </button>
                  ) : null}
                </div>
              ) : null}
            </>
          )}
          {replying === c.id ? <CommentForm postId={postId} parent={c.id} compact onDone={added} onCancel={() => setReplying(null)} /> : null}
        </div>
        {kids.length > 0 ? depth >= MAX_DEPTH ? kids.map((k) => render(k, depth)) : <ul className="kb-c-kids">{kids.map((k) => render(k, depth + 1))}</ul> : null}
      </li>
    )
  }

  const roots = order(byParent.get(null) ?? [], true)
  return (
    <div className="kb-comments">
      <div className="kb-c-top">
        <p className="kb-sec-title">
          {total} comment{total === 1 ? '' : 's'}
        </p>
        {roots.length > 1 ? (
          <div className="kb-seg kb-seg-sm" role="radiogroup" aria-label="Sort comments">
            {(
              [
                ['top', 'Top'],
                ['new', 'Newest'],
                ['old', 'Oldest'],
              ] as const
            ).map(([k, label]) => (
              <button key={k} type="button" role="radio" aria-checked={sort === k} onClick={() => setSort(k)}>
                {label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      {settings.comments === 'locked' ? (
        <p className="kb-note">Comments on this post are closed.</p>
      ) : canWrite ? (
        <>
          {settings.signIn || reader ? <Identity key={reader?.id ?? 'anon'} reader={reader} /> : null}
          <CommentForm postId={postId} onDone={added} />
        </>
      ) : (
        <p className="kb-note">Sign in to join the conversation.</p>
      )}
      {note ? <p className="kb-note">{note}</p> : null}
      {roots.length ? <ul className="kb-c-list">{roots.map((c) => render(c, 1))}</ul> : <p className="kb-empty-c">No comments yet. Start the conversation.</p>}
      {!reader && settings.signIn && settings.comments === 'on' ? (
        <div className="kb-signin-inline">
          <SignInOptions why="to use your name, edit your comments, like and rate" />
        </div>
      ) : null}
      {settings.comments === 'on' ? <p className="kb-rules">Be kind and stay on topic. Abuse is refused, anything doubtful waits for approval{settings.reports ? ', and anyone can report a comment' : ''}.</p> : null}
      {reporting ? <ReportDialog commentId={reporting} onClose={() => setReporting(null)} /> : null}
    </div>
  )
}
