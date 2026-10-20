'use client'

import { useEffect, useRef, useState } from 'react'
import { StarIcon } from './StarButton'

type Comment = { id: number; parent: number | null; name: string; body: string; likes: number; liked: boolean; pending: boolean; mine: boolean; createdAt: string }
type Review = { id: number; name: string; rating: number; review?: string; pending: boolean; mine: boolean; createdAt: string }
type Thread = {
  settings: { comments: boolean; reviews: boolean; feedback: boolean }
  comments: Comment[]
  reviews: { count: number; average: number; items: Review[]; mine: { rating: number; review: string; name: string; pending: boolean } | null }
}

const remember = (key: string, value?: string) => {
  try {
    if (value === undefined) return localStorage.getItem(key) ?? ''
    if (value) localStorage.setItem(key, value)
  } catch {}
  return ''
}

const post = async (path: string, body: object) => {
  const res = await fetch(`/api/kb/${path}`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).catch(() => null)
  return ((await res?.json().catch(() => null)) ?? { error: 'Could not reach the server. Please try again.' }) as { ok?: boolean; pending?: boolean; error?: string; errors?: Record<string, string>; comment?: Comment; liked?: boolean; likes?: number }
}
const firstError = (b: { error?: string; errors?: Record<string, string> }) => (b.errors ? Object.values(b.errors)[0] : b.error) ?? 'Something went wrong.'

function ago(iso: string, now: number) {
  const s = Math.max(0, (now - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)} min ago`
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`
  if (s < 86400 * 30) return `${Math.floor(s / 86400)} d ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?'
const hue = (name: string) => [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7)

/** Ratings, reviews and threaded comments under a post. Loaded fresh for each visitor. */
export function Discussion({ postId }: { postId: string }) {
  const [thread, setThread] = useState<Thread | null>(null)
  const [now, setNow] = useState(0)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let live = true
    fetch(`/api/kb/thread?post=${postId}`, { credentials: 'include', cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((t: Thread) => {
        if (!live) return
        setThread(t)
        setNow(Date.now())
      })
      .catch(() => live && setFailed(true))
    return () => {
      live = false
    }
  }, [postId])

  if (failed) return null
  if (!thread) return <div className="kb-discussion kb-loading" aria-busy="true" />
  const { settings } = thread
  if (!settings.comments && !settings.reviews) return null
  return (
    <section className="kb-discussion" aria-label="Ratings and comments">
      {settings.reviews ? <Ratings postId={postId} thread={thread} setThread={setThread} now={now} /> : null}
      {settings.comments ? <Comments postId={postId} thread={thread} setThread={setThread} now={now} /> : null}
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

function Ratings({ postId, thread, setThread, now }: { postId: string; thread: Thread; setThread: (t: Thread) => void; now: number }) {
  const mine = thread.reviews.mine
  const [rating, setRating] = useState(mine?.rating ?? 0)
  const [writing, setWriting] = useState(false)
  const [review, setReview] = useState(mine?.review ?? '')
  const [name, setName] = useState(mine?.name || remember('kb-name'))
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null)
  const startedAt = useRef(0)

  const save = async (n: number, withReview: boolean) => {
    setRating(n)
    const body = await post('review', { post: postId, rating: n, review: withReview ? review : mine?.review ?? '', name: withReview ? name : mine?.name ?? name, startedAt: startedAt.current })
    if (!body.ok) return setMsg({ text: firstError(body), error: true })
    remember('kb-name', name)
    const fresh = (await fetch(`/api/kb/thread?post=${postId}`, { credentials: 'include', cache: 'no-store' }).then((r) => r.json()).catch(() => null)) as Thread | null
    if (fresh) setThread(fresh)
    if (withReview) setWriting(false)
    setMsg({ text: body.pending ? 'Thanks! Your review will show once it is approved.' : withReview ? 'Thanks for the review!' : 'Thanks for rating!' })
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
      {rating > 0 && !writing ? (
        <button
          type="button"
          className="kb-link"
          onClick={() => {
            startedAt.current = Date.now()
            setWriting(true)
          }}
        >
          {mine?.review ? 'Edit your review' : 'Add a short review (optional)'}
        </button>
      ) : null}
      {writing ? (
        <form
          className="kb-form"
          onSubmit={(e) => {
            e.preventDefault()
            void save(rating, true)
          }}
        >
          <textarea value={review} onChange={(e) => setReview(e.target.value)} rows={3} maxLength={1000} placeholder="What did you like, or what was missing?" autoFocus />
          <div className="kb-form-row">
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="Your name (optional)" aria-label="Your name (optional)" />
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
                <Avatar name={r.name} />
                <strong>{r.name}</strong>
                <Stars value={r.rating} size={12} />
                <span className="kb-c-time">{ago(r.createdAt, now)}</span>
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

function Avatar({ name }: { name: string }) {
  return (
    <span className="kb-avatar" style={{ background: `hsl(${hue(name)} 55% 42%)` }} aria-hidden="true">
      {initials(name)}
    </span>
  )
}

function CommentForm({ postId, parent, onDone, onCancel, compact }: { postId: string; parent?: number; onDone: (c: Comment, pending: boolean) => void; onCancel?: () => void; compact?: boolean }) {
  const [name, setName] = useState(() => remember('kb-name'))
  const [email, setEmail] = useState(() => remember('kb-email'))
  const [text, setText] = useState('')
  const [state, setState] = useState<{ busy?: boolean; error?: string }>({})
  const startedAt = useRef(0)
  const website = useRef<HTMLInputElement>(null)
  useEffect(() => {
    startedAt.current = Date.now()
  }, [])

  return (
    <form
      className={`kb-form${compact ? ' kb-form-reply' : ''}`}
      onSubmit={async (e) => {
        e.preventDefault()
        setState({ busy: true })
        const body = await post('comment', { post: postId, parent, name, email, body: text, website: website.current?.value ?? '', startedAt: startedAt.current })
        if (!body.ok || !body.comment) return setState({ error: firstError(body) })
        remember('kb-name', name)
        remember('kb-email', email)
        setText('')
        setState({})
        onDone(body.comment, Boolean(body.pending))
      }}
    >
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={compact ? 2 : 3} maxLength={2000} required placeholder={parent ? 'Write a reply…' : 'Share a thought, a question or a tip…'} autoFocus={compact} aria-label={parent ? 'Your reply' : 'Your comment'} />
      <div className="kb-form-row">
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required placeholder="Your name" aria-label="Your name" />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={200} placeholder="Email (optional, never shown)" aria-label="Email (optional, never shown)" />
        <input ref={website} type="text" name="website" tabIndex={-1} autoComplete="off" className="kb-hp" aria-hidden="true" />
        {onCancel ? (
          <button type="button" className="btn ghost" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
        <button type="submit" className="btn" disabled={state.busy}>
          {state.busy ? 'Posting…' : parent ? 'Reply' : 'Comment'}
        </button>
      </div>
      {state.error ? <p className="kb-error">{state.error}</p> : null}
    </form>
  )
}

const MAX_DEPTH = 4

function Comments({ postId, thread, setThread, now }: { postId: string; thread: Thread; setThread: (t: Thread) => void; now: number }) {
  const [sort, setSort] = useState<'top' | 'new' | 'old'>('top')
  const [replying, setReplying] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const all = thread.comments
  const byParent = new Map<number | null, Comment[]>()
  for (const c of all) {
    const key = c.parent && all.some((p) => p.id === c.parent) ? c.parent : null
    byParent.set(key, [...(byParent.get(key) ?? []), c])
  }
  const order = (list: Comment[], top: boolean) =>
    [...list].sort((a, b) => (top && sort === 'top' ? b.likes - a.likes || +new Date(b.createdAt) - +new Date(a.createdAt) : sort === 'new' && top ? +new Date(b.createdAt) - +new Date(a.createdAt) : +new Date(a.createdAt) - +new Date(b.createdAt)))
  const total = all.filter((c) => !c.pending).length

  const added = (c: Comment, pending: boolean) => {
    setThread({ ...thread, comments: [...thread.comments, c] })
    setReplying(null)
    setNote(pending ? 'Thanks! It will show for everyone once it is approved. You can already see it.' : '')
  }
  const like = async (c: Comment) => {
    const flip = (liked: boolean, likes: number) => setThread({ ...thread, comments: thread.comments.map((x) => (x.id === c.id ? { ...x, liked, likes } : x)) })
    flip(!c.liked, c.likes + (c.liked ? -1 : 1))
    const body = await post('like', { comment: c.id })
    if (typeof body.likes === 'number') flip(Boolean(body.liked), body.likes)
  }

  const render = (c: Comment, depth: number): React.ReactNode => {
    const kids = order(byParent.get(c.id) ?? [], false)
    const parentName = depth >= MAX_DEPTH ? all.find((p) => p.id === c.parent)?.name : undefined
    return (
      <li key={c.id} className="kb-c">
        <div className="kb-c-card" data-pending={c.pending || undefined}>
          <div className="kb-c-head">
            <Avatar name={c.name} />
            <strong>{c.name}</strong>
            {parentName ? <span className="kb-c-to">↳ {parentName}</span> : null}
            <span className="kb-c-time">{ago(c.createdAt, now)}</span>
            {c.pending ? <span className="kb-badge">Waiting for approval</span> : null}
          </div>
          <p className="kb-c-body">{c.body}</p>
          {!c.pending ? (
            <div className="kb-c-actions">
              <button type="button" aria-pressed={c.liked} onClick={() => void like(c)} className="kb-like">
                <svg width="14" height="14" viewBox="0 0 24 24" fill={c.liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.6 4.5 7 4.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.4 0 5.6 3.4 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2Z" />
                </svg>
                {c.likes > 0 ? c.likes : 'Like'}
              </button>
              <button type="button" onClick={() => setReplying(replying === c.id ? null : c.id)}>
                Reply
              </button>
            </div>
          ) : null}
          {replying === c.id ? <CommentForm postId={postId} parent={c.id} compact onDone={added} onCancel={() => setReplying(null)} /> : null}
        </div>
        {kids.length > 0 ? (
          depth >= MAX_DEPTH ? (
            kids.map((k) => render(k, depth))
          ) : (
            <ul className="kb-c-kids">{kids.map((k) => render(k, depth + 1))}</ul>
          )
        ) : null}
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
      <CommentForm postId={postId} onDone={added} />
      {note ? <p className="kb-note">{note}</p> : null}
      {roots.length ? <ul className="kb-c-list">{roots.map((c) => render(c, 1))}</ul> : <p className="kb-empty-c">No comments yet. Start the conversation.</p>}
      <p className="kb-rules">Be kind and stay on topic. Comments with abuse are refused; anything doubtful waits for approval.</p>
    </div>
  )
}
