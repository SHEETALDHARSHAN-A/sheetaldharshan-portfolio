'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const REASONS = [
  ['spam', 'Spam or advertising'],
  ['abuse', 'Abuse or harassment'],
  ['hate', 'Hate or discrimination'],
  ['misleading', 'False or misleading'],
  ['off-topic', 'Off-topic'],
  ['other', 'Something else'],
] as const

/** Report a comment to the author of the site, with a reason. Open to everyone. */
export function ReportDialog({ commentId, onClose }: { commentId: number; onClose: () => void }) {
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [state, setState] = useState<{ busy?: boolean; done?: boolean; error?: string }>({})
  const startedAt = useRef(0)
  useEffect(() => {
    startedAt.current = Date.now()
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])

  return createPortal(
    <div className="kb-modal" role="dialog" aria-modal="true" aria-label="Report comment" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form
        className="kb-modal-card"
        onSubmit={async (e) => {
          e.preventDefault()
          if (!reason) return setState({ error: 'Pick a reason.' })
          setState({ busy: true })
          const res = await fetch('/api/kb/report', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comment: commentId, reason, note, startedAt: startedAt.current }) }).catch(() => null)
          const body = (await res?.json().catch(() => null)) as { ok?: boolean; error?: string; errors?: Record<string, string> } | null
          if (body?.ok) {
            setState({ done: true })
            window.setTimeout(onClose, 2200)
          } else setState({ error: body?.errors ? Object.values(body.errors)[0] : body?.error ?? 'It could not be sent.' })
        }}
      >
        {state.done ? (
          <p className="kb-done">Thanks for letting me know. I&apos;ll take a look. 🙏</p>
        ) : (
          <>
            <div className="kb-modal-head">
              <strong>Report this comment</strong>
              <button type="button" className="kb-x" onClick={onClose} aria-label="Close">
                ×
              </button>
            </div>
            <div className="kb-reasons" role="radiogroup" aria-label="Reason">
              {REASONS.map(([value, label]) => (
                <label key={value} className="kb-reason" data-on={reason === value || undefined}>
                  <input type="radio" name="reason" value={value} checked={reason === value} onChange={() => setReason(value)} />
                  {label}
                </label>
              ))}
            </div>
            <label className="kb-field">
              <span>
                Anything to add? <i>(optional)</i>
              </span>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={1000} />
            </label>
            {state.error ? <p className="kb-error">{state.error}</p> : null}
            <div className="kb-actions">
              <button type="button" className="btn ghost" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn" disabled={state.busy}>
                {state.busy ? 'Sending…' : 'Report'}
              </button>
            </div>
          </>
        )}
      </form>
    </div>,
    document.body,
  )
}
