'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * The site's own "Are you sure?" dialog, in place of the browser's confirm box.
 * `await confirmAction({...})` resolves true when the reader confirms.
 */
type Ask = { title: string; body?: string; confirm?: string; cancel?: string; danger?: boolean; icon?: 'logout' | 'trash' }
type Pending = Ask & { resolve: (ok: boolean) => void }

export function confirmAction(ask: Ask): Promise<boolean> {
  return new Promise((resolve) => window.dispatchEvent(new CustomEvent<Pending>('kb-confirm', { detail: { ...ask, resolve } })))
}

const ICONS = {
  logout: <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H4" />,
  trash: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />,
}

/** Mounted once per page (./stdout layout); shows whatever confirmAction asks. */
export function ConfirmHost() {
  const [ask, setAsk] = useState<Pending | null>(null)
  const ok = useRef<HTMLButtonElement>(null)
  const close = (answer: boolean) => {
    ask?.resolve(answer)
    setAsk(null)
  }
  useEffect(() => {
    const open = (e: Event) => setAsk((e as CustomEvent<Pending>).detail)
    window.addEventListener('kb-confirm', open)
    return () => window.removeEventListener('kb-confirm', open)
  }, [])
  useEffect(() => {
    if (!ask) return
    ok.current?.focus()
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && close(false)
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  })
  if (!ask) return null
  return createPortal(
    <div className="kb-modal" role="alertdialog" aria-modal="true" aria-labelledby="kb-confirm-title" onMouseDown={(e) => e.target === e.currentTarget && close(false)}>
      <div className="kb-modal-card kb-confirm">
        {ask.icon ? (
          <span className="kb-confirm-icon" data-danger={ask.danger || undefined} aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {ICONS[ask.icon]}
            </svg>
          </span>
        ) : null}
        <p id="kb-confirm-title" className="kb-confirm-title">
          {ask.title}
        </p>
        {ask.body ? <p className="kb-note">{ask.body}</p> : null}
        <div className="kb-actions">
          <button type="button" className="btn ghost" onClick={() => close(false)}>
            {ask.cancel ?? 'Cancel'}
          </button>
          <button ref={ok} type="button" className={`btn${ask.danger ? ' kb-danger-solid' : ''}`} onClick={() => close(true)}>
            {ask.confirm ?? 'OK'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
