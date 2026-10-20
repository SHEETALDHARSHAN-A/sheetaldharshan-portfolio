'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const PROBLEMS: Record<string, string> = {
  expired: 'That sign-in link has expired or was already used. Send yourself a new one.',
  invalid: 'That sign-in link is not valid. Send yourself a new one.',
  blocked: 'This account cannot sign in here.',
  failed: 'Signing in did not work. Please try again.',
  unavailable: 'GitHub sign-in is not available right now. Use an email link instead.',
  deleted: 'Your account and its data were deleted. Thanks for reading.',
}

/** The sign-in choices: GitHub, or a one-time link by email. Used in the dialog and under posts. */
export function SignInOptions({ why }: { why?: string }) {
  const pathname = usePathname()
  const [mode, setMode] = useState<'pick' | 'email' | 'sent'>('pick')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [state, setState] = useState<{ busy?: boolean; error?: string }>({})
  const startedAt = useRef(0)
  const next = typeof window === 'undefined' ? pathname : `${pathname}${window.location.hash || ''}`

  if (mode === 'sent')
    return (
      <div className="kb-signin">
        <p className="kb-signin-title">Check your inbox ✉️</p>
        <p className="kb-note">
          We sent a sign-in link to <strong>{email}</strong>. It works once, for 15 minutes. Not there? Check spam, or{' '}
          <button type="button" className="kb-link" onClick={() => setMode('email')}>
            send it again
          </button>
          .
        </p>
      </div>
    )

  return (
    <div className="kb-signin">
      <p className="kb-signin-title">Sign in {why ?? 'to comment, like and rate'}</p>
      <p className="kb-note">
        No password needed. Your email is never shown. See the <Link href="/privacy">privacy notice</Link>.
      </p>
      <div className="kb-signin-buttons">
        <a className="btn kb-gh" href={`/auth/reader/github?next=${encodeURIComponent(next)}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2 0 1.9 1.2 1.9 1.2 1 1.8 2.8 1.3 3.5 1 0-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.3-3.1-.2-.4-.6-1.6 0-3.2 0 0 1-.3 3.4 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8 0 3.2.9.8 1.3 1.9 1.3 3.2 0 4.6-2.8 5.6-5.5 5.9.5.4.9 1 .9 2.2v3.3c0 .3.1.7.8.6A12 12 0 0 0 12 .3" />
          </svg>
          Continue with GitHub
        </a>
        {mode === 'pick' ? (
          <button
            type="button"
            className="btn ghost"
            onClick={() => {
              startedAt.current = Date.now()
              setMode('email')
            }}
          >
            Email me a sign-in link
          </button>
        ) : null}
      </div>
      {mode === 'email' ? (
        <form
          className="kb-form"
          onSubmit={async (e) => {
            e.preventDefault()
            setState({ busy: true })
            const website = (e.currentTarget.querySelector('input[name="website"]') as HTMLInputElement | null)?.value ?? ''
            const res = await fetch('/api/kb/email-link', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, name, next, website, startedAt: startedAt.current }) }).catch(() => null)
            const body = (await res?.json().catch(() => null)) as { ok?: boolean; error?: string; errors?: Record<string, string> } | null
            if (body?.ok) {
              setState({})
              setMode('sent')
            } else setState({ error: body?.errors ? Object.values(body.errors)[0] : body?.error ?? 'It could not be sent. Please try again.' })
          }}
        >
          <div className="kb-form-row">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" aria-label="Your email" autoFocus />
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="Your name (shown on comments)" aria-label="Your name" />
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="kb-hp" aria-hidden="true" />
            <button type="submit" className="btn" disabled={state.busy}>
              {state.busy ? 'Sending…' : 'Send link'}
            </button>
          </div>
          {state.error ? <p className="kb-error">{state.error}</p> : null}
        </form>
      ) : null}
    </div>
  )
}

/** The sign-in dialog, opened by askToSignIn() (e.g. liking while signed out), and sign-in problems from the URL. */
export function SignInDialog() {
  const [open, setOpen] = useState<{ why?: string; problem?: string } | null>(null)
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const show = (e: Event) => setOpen({ why: (e as CustomEvent<string | undefined>).detail })
    window.addEventListener('kb-signin', show)
    return () => window.removeEventListener('kb-signin', show)
  }, [])

  // ?signin=expired etc., set by the sign-in routes: say what happened, then tidy the address bar.
  const problem = params.get('signin')
  useEffect(() => {
    if (!problem) return
    setOpen({ problem: PROBLEMS[problem] ?? PROBLEMS.failed })
    router.replace(pathname, { scroll: false })
  }, [problem, pathname, router])

  useEffect(() => {
    if (!open) return
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null)
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [open])

  if (!open) return null
  return createPortal(
    <div className="kb-modal" role="dialog" aria-modal="true" aria-label="Sign in" onMouseDown={(e) => e.target === e.currentTarget && setOpen(null)}>
      <div className="kb-modal-card">
        <div className="kb-modal-head">
          <strong>Sign in to Field Notes</strong>
          <button type="button" className="kb-x" onClick={() => setOpen(null)} aria-label="Close">
            ×
          </button>
        </div>
        {open.problem ? <p className={open.problem.startsWith('Your account') ? 'kb-note' : 'kb-error'}>{open.problem}</p> : null}
        <SignInOptions why={open.why} />
      </div>
    </div>,
    document.body,
  )
}
