'use client'

import { useEffect, useRef, useState } from 'react'
import { askToSignIn, useReader } from './reader'
import { listActions, listError, useLists } from './lists'

function BookmarkIcon({ on }: { on: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 3h12v18l-6-4-6 4z" />
    </svg>
  )
}

/** Save this post into one or more of your own channels, or a new one. */
export function SaveButton({ postId }: { postId: string }) {
  const { reader } = useReader()
  const lists = useLists(reader?.id)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const box = useRef<HTMLDivElement>(null)
  const id = Number(postId)
  const savedIn = lists.filter((l) => l.posts.includes(id))

  useEffect(() => {
    if (!open) return
    const away = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false)
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', away)
    window.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', away)
      window.removeEventListener('keydown', esc)
    }
  }, [open])

  return (
    <div className="kb-save" ref={box}>
      <button
        type="button"
        className="kb-star"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-pressed={savedIn.length > 0}
        onClick={() => (reader ? setOpen((o) => !o) : askToSignIn('to save posts into your own channels'))}
      >
        <BookmarkIcon on={savedIn.length > 0} />
        <span>{savedIn.length ? `Saved${savedIn.length > 1 ? ` in ${savedIn.length}` : ''}` : 'Save'}</span>
      </button>
      {open ? (
        <div className="kb-save-pop" role="dialog" aria-label="Save to your channels">
          <p className="kb-save-title">Save to your channels</p>
          {lists.length ? (
            <ul>
              {lists.map((l) => {
                const on = l.posts.includes(id)
                return (
                  <li key={l.id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={async () => {
                          const r = await listActions.save(l.id, id, !on)
                          setError(r.ok ? '' : listError(r))
                        }}
                      />
                      <span>
                        {l.emoji || '#'} {l.name}
                      </span>
                      <i>{l.count}</i>
                    </label>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="kb-note">You have no channels yet. Make one for this post:</p>
          )}
          <form
            className="kb-save-new"
            onSubmit={async (e) => {
              e.preventDefault()
              if (!name.trim()) return
              const r = await listActions.create(name, { post: id })
              if (r.ok) setName('')
              setError(r.ok ? '' : listError(r))
            }}
          >
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="New channel, e.g. Read later" aria-label="New channel name" />
            <button type="submit" className="btn" disabled={!name.trim()}>
              Create
            </button>
          </form>
          {error ? <p className="kb-error">{error}</p> : null}
        </div>
      ) : null}
    </div>
  )
}
