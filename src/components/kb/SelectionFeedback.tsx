'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type Kind = 'wrong' | 'simpler' | 'other'
const KINDS: { kind: Kind; label: string; hint: string }[] = [
  { kind: 'wrong', label: 'Looks wrong', hint: 'What is wrong or out of date?' },
  { kind: 'simpler', label: 'Say it simpler', hint: 'What was hard to follow?' },
  { kind: 'other', label: 'Feedback', hint: 'What would you like to say?' },
]

/**
 * Select text in a post and a small bar appears: "Looks wrong", "Say it simpler" or "Feedback".
 * The note (with the selected text) is saved in the admin and emailed to the author. A button under
 * the post sends feedback without a selection.
 */
export function SelectionFeedback({ postId, enabled = true, children }: { postId: string; enabled?: boolean; children: React.ReactNode }) {
  const box = useRef<HTMLDivElement>(null)
  const [bar, setBar] = useState<{ x: number; y: number; below: boolean; quote: string } | null>(null)
  const [form, setForm] = useState<{ kind: Kind; quote: string; startedAt: number } | null>(null)

  useEffect(() => {
    if (!enabled) return
    let timer = 0
    const touch = window.matchMedia('(pointer: coarse)').matches
    const check = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        const sel = window.getSelection()
        const text = sel?.toString().replace(/\s+/g, ' ').trim() ?? ''
        if (!sel || sel.isCollapsed || text.length < 3 || !box.current || !box.current.contains(sel.anchorNode) || !box.current.contains(sel.focusNode)) {
          setBar(null)
          return
        }
        const r = sel.getRangeAt(0).getBoundingClientRect()
        // On phones the system copy menu sits above a selection, so the bar goes below it.
        const below = touch || r.top < 70
        setBar({ x: Math.min(Math.max(r.left + r.width / 2, 150), window.innerWidth - 150), y: below ? r.bottom + 10 : r.top - 10, below, quote: text.slice(0, 1000) })
      }, 180)
    }
    const hide = () => setBar(null)
    document.addEventListener('selectionchange', check)
    window.addEventListener('scroll', hide, true)
    window.addEventListener('resize', hide)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('selectionchange', check)
      window.removeEventListener('scroll', hide, true)
      window.removeEventListener('resize', hide)
    }
  }, [enabled])

  const open = (kind: Kind, quote: string) => {
    setForm({ kind, quote, startedAt: Date.now() })
    setBar(null)
    window.getSelection()?.removeAllRanges()
  }

  return (
    <div ref={box} className="kb-selectable">
      {children}
      {enabled ? <div className="kb-feedback-cta">
        <span>Spotted something wrong, or could it be clearer?</span>
        <span className="kb-feedback-tip">Select any text to point at it, or</span>
        <button type="button" className="btn ghost" onClick={() => open('other', '')}>
          Send feedback
        </button>
      </div> : null}
      {bar
        ? createPortal(
            <div className="kb-selbar" data-below={bar.below || undefined} style={{ left: bar.x, top: bar.y }} role="toolbar" aria-label="Feedback on the selected text" onMouseDown={(e) => e.preventDefault()}>
              {KINDS.map((k) => (
                <button key={k.kind} type="button" onClick={() => open(k.kind, bar.quote)}>
                  {k.label}
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
      {form ? createPortal(<FeedbackForm postId={postId} initial={form} onClose={() => setForm(null)} />, document.body) : null}
    </div>
  )
}

function FeedbackForm({ postId, initial, onClose }: { postId: string; initial: { kind: Kind; quote: string; startedAt: number }; onClose: () => void }) {
  const [kind, setKind] = useState<Kind>(initial.kind)
  const [note, setNote] = useState('')
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem('kb-email') ?? ''
    } catch {
      return ''
    }
  })
  const [state, setState] = useState<{ busy?: boolean; done?: boolean; error?: string }>({})
  const field = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    field.current?.focus()
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    setState({ busy: true })
    const website = (e.currentTarget as HTMLFormElement).querySelector<HTMLInputElement>('input[name="website"]')?.value ?? ''
    const res = await fetch('/api/kb/feedback', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post: postId, kind, quote: initial.quote, note, email, website, startedAt: initial.startedAt }),
    }).catch(() => null)
    const body = (await res?.json().catch(() => null)) as { ok?: boolean; error?: string; errors?: Record<string, string> } | null
    if (body?.ok) {
      try {
        if (email) localStorage.setItem('kb-email', email)
      } catch {}
      setState({ done: true })
      window.setTimeout(onClose, 2200)
    } else setState({ error: body?.errors ? Object.values(body.errors)[0] : body?.error ?? 'It could not be sent. Please try again.' })
  }

  const hint = KINDS.find((k) => k.kind === kind)?.hint
  return (
    <div className="kb-modal" role="dialog" aria-modal="true" aria-label="Send feedback" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="kb-modal-card" onSubmit={send}>
        {state.done ? (
          <p className="kb-done">Thank you! It&apos;s on its way to me. 🙌</p>
        ) : (
          <>
            <div className="kb-modal-head">
              <strong>Send feedback</strong>
              <button type="button" className="kb-x" onClick={onClose} aria-label="Close">
                ×
              </button>
            </div>
            <div className="kb-seg" role="radiogroup" aria-label="Kind of feedback">
              {KINDS.map((k) => (
                <button key={k.kind} type="button" role="radio" aria-checked={kind === k.kind} onClick={() => setKind(k.kind)}>
                  {k.label}
                </button>
              ))}
            </div>
            {initial.quote ? <blockquote className="kb-quote">{initial.quote}</blockquote> : null}
            <label className="kb-field">
              <span>{hint}</span>
              <textarea ref={field} value={note} onChange={(e) => setNote(e.target.value)} rows={4} maxLength={2000} required={!initial.quote} placeholder={kind === 'simpler' ? 'e.g. I lost track at the second paragraph…' : kind === 'wrong' ? 'e.g. This flag was renamed in v2…' : 'Anything at all'} />
            </label>
            <label className="kb-field">
              <span>
                Your email <i>(optional, if you&apos;d like a reply)</i>
              </span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={200} placeholder="you@example.com" />
            </label>
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="kb-hp" aria-hidden="true" />
            {state.error ? <p className="kb-error">{state.error}</p> : null}
            <div className="kb-actions">
              <button type="button" className="btn ghost" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn" disabled={state.busy}>
                {state.busy ? 'Sending…' : 'Send'}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  )
}
