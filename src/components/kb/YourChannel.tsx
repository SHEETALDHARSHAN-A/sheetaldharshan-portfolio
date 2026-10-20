'use client'

import { confirmAction } from './Confirm'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { KbEmptyClient } from './KbEmptyClient'
import { listActions, listError, type List } from './lists'
import { useReader } from './reader'
import { SignInOptions } from './SignIn'

type Saved = { id: number; slug: string; title: string; excerpt: string; publishedAt?: string; channel: { title: string; slug: string; emoji?: string } | null }

const date = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '')

/** A reader's own channel: rename it, describe it, delete it, and see or remove the posts saved in it. */
export function YourChannel({ id }: { id: string }) {
  const { reader, ready } = useReader()
  const router = useRouter()
  const [data, setData] = useState<{ list: List; posts: Saved[] } | null>(null)
  const [missing, setMissing] = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', emoji: '' })
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const res = await fetch(`/api/kb/list?id=${encodeURIComponent(id)}`, { credentials: 'include', cache: 'no-store' }).catch(() => null)
    if (!res?.ok) return setMissing(true)
    setData(await res.json())
  }, [id])
  useEffect(() => {
    if (reader) void load()
  }, [reader, load])

  if (!ready) return <div className="kb-loading" aria-busy="true" />
  if (!reader) return <SignInOptions why="to see your channels" />
  if (missing)
    return (
      <div className="kb-me">
        <KbEmptyClient command={`cd ./stdout/saved/${id}`} lines={['no such channel']} />
        <Link href="/notes" className="kb-link">
          Back to ./stdout
        </Link>
      </div>
    )
  if (!data) return <div className="kb-loading" aria-busy="true" />
  const { list, posts } = data

  return (
    <div className="kb-me">
      <header className="page-head kb-head kb-own-head">
        <span className="eyebrow">Your channel · private</span>
        {editing ? (
          <form
            className="kb-form"
            onSubmit={async (e) => {
              e.preventDefault()
              const r = await listActions.update(list.id, form)
              if (!r.ok || !r.list) return setError(listError(r))
              setData({ ...data, list: r.list })
              setEditing(false)
              setError('')
            }}
          >
            <div className="kb-form-row">
              <input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} maxLength={8} placeholder="Emoji" aria-label="Emoji (optional)" className="kb-emoji-input" />
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={60} required aria-label="Channel name" autoFocus />
            </div>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={200} placeholder="What is it for? (optional)" aria-label="Description" />
            <div className="kb-form-row kb-form-end">
              <button type="button" className="btn ghost" onClick={() => setEditing(false)}>
                Cancel
              </button>
              <button type="submit" className="btn">
                Save
              </button>
            </div>
          </form>
        ) : (
          <>
            <h1>
              {list.emoji || '◆'} {list.name}
            </h1>
            <p>{list.description || `${list.count} saved post${list.count === 1 ? '' : 's'}. Only you can see this channel.`}</p>
            <div className="kb-inline-actions">
              <button
                type="button"
                className="kb-link"
                onClick={() => {
                  setForm({ name: list.name, description: list.description, emoji: list.emoji })
                  setEditing(true)
                }}
              >
                Rename or describe
              </button>
              <button
                type="button"
                className="kb-link kb-link-muted"
                onClick={async () => {
                  if (!(await confirmAction({ title: `Delete “${list.name}”?`, body: 'Only this channel of yours goes; the posts in it stay on ./stdout, and other channels are not touched.', confirm: 'Delete channel', danger: true, icon: 'trash' }))) return
                  const r = await listActions.remove(list.id)
                  if (!r.ok) return setError(listError(r))
                  router.push('/notes/me')
                }}
              >
                Delete channel
              </button>
            </div>
          </>
        )}
        {error ? <p className="kb-error">{error}</p> : null}
      </header>
      {posts.length === 0 ? (
        <KbEmptyClient command={`ls ./stdout/saved/${list.name.toLowerCase().replace(/\s+/g, '-')}`} lines={['(empty: use Save on any post to add it here)']} />
      ) : (
        <div className="kb-cards">
          {posts.map((p) => (
            <article key={p.id} className="kb-card">
              <span className="eyebrow kb-card-meta">{[p.channel ? `${p.channel.emoji ?? '#'} ${p.channel.title}` : null, date(p.publishedAt)].filter(Boolean).join(' · ')}</span>
              <h2>
                <Link href={`/notes/${p.slug}`} className="kb-card-link">
                  {p.title}
                </Link>
              </h2>
              {p.excerpt ? <p>{p.excerpt}</p> : null}
              <button
                type="button"
                className="kb-link kb-link-muted kb-card-remove"
                onClick={async () => {
                  const r = await listActions.save(list.id, p.id, false)
                  if (!r.ok) return setError(listError(r))
                  setData({ list: r.list ?? list, posts: posts.filter((x) => x.id !== p.id) })
                }}
              >
                Remove from this channel
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
