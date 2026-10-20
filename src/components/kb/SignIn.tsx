'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { setReader, type Reader } from './reader'

const PROBLEMS: Record<string, string> = {
  expired: 'That sign-in link has expired or was already used. Send yourself a new one.',
  invalid: 'That sign-in link is not valid. Send yourself a new one.',
  blocked: 'This account cannot sign in here.',
  failed: 'Signing in did not work. Please try again.',
  unavailable: 'GitHub sign-in is not available right now. Use an email link instead.',
  deleted: 'Your account and its data were deleted. Thanks for reading.',
}

/** The sign-in choices, laid out like the Contact form: GitHub, or a one-time link by email. */
export function SignInOptions({ why, heading = true }: { why?: string; heading?: boolean }) {
  const pathname = usePathname()
  const [sent, setSent] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [state, setState] = useState<{ busy?: boolean; error?: string; field?: 'email' | 'name' }>({})
  const startedAt = useRef(0)
  useEffect(() => {
    startedAt.current = Date.now()
  }, [])
  const next = typeof window === 'undefined' ? pathname : `${pathname}${window.location.hash || ''}`

  // After the link is sent, wait for it to be opened (on a phone or here); then this browser signs in.
  useEffect(() => {
    if (!sent) return
    let stop = false
    const started = Date.now()
    const tick = async () => {
      if (stop) return
      const r = (await fetch('/api/kb/email-link-status', { credentials: 'include', cache: 'no-store' })
        .then((x) => x.json())
        .catch(() => null)) as { signedIn?: boolean; reader?: Reader; expired?: boolean } | null
      if (stop) return
      if (r?.signedIn && r.reader) {
        setReader(r.reader)
        window.dispatchEvent(new Event('kb-signed-in'))
        return
      }
      if (r?.expired || Date.now() - started > 15 * 60_000) return setState({ error: 'That link expired. Send a new one.' })
      window.setTimeout(tick, document.hidden ? 6000 : 3000)
    }
    const id = window.setTimeout(tick, 3000)
    return () => {
      stop = true
      window.clearTimeout(id)
    }
  }, [sent])

  if (sent)
    return (
      <div className="kb-signin kb-signin-sent" role="status">
        <span className="kb-signin-mark" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6h16v12H4z" />
            <path d="m4 7 8 6 8-6" />
          </svg>
        </span>
        <p className="kb-signin-title">Check your inbox</p>
        <p className="kb-note">
          A sign-in link is on its way to <strong>{email}</strong>. Open it on any device, even your phone: <strong>this page signs in by itself</strong> as soon as you approve.
        </p>
        {state.error ? (
          <p className="kb-error">{state.error}</p>
        ) : (
          <p className="kb-waiting">
            <i aria-hidden="true" /> Waiting for you to open the link…
          </p>
        )}
        <button
          type="button"
          className="btn ghost kb-signin-wide"
          onClick={() => {
            setSent(false)
            setState({})
          }}
        >
          Use a different email
        </button>
      </div>
    )

  return (
    <div className="kb-signin">
      {heading ? (
        <div>
          <p className="kb-signin-title">Sign in {why ?? 'to comment, like and rate'}</p>
          <p className="kb-note">No password needed.</p>
        </div>
      ) : null}
      <a className="btn kb-signin-wide kb-gh" href={`/auth/reader/github?next=${encodeURIComponent(next)}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2 0 1.9 1.2 1.9 1.2 1 1.8 2.8 1.3 3.5 1 0-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.3-3.1-.2-.4-.6-1.6 0-3.2 0 0 1-.3 3.4 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8 0 3.2.9.8 1.3 1.9 1.3 3.2 0 4.6-2.8 5.6-5.5 5.9.5.4.9 1 .9 2.2v3.3c0 .3.1.7.8.6A12 12 0 0 0 12 .3" />
        </svg>
        Continue with GitHub
        <span className="kb-gh-note">verified badge</span>
      </a>
      <div className="kb-or" aria-hidden="true">
        <span>or get a link by email</span>
      </div>
      <form
        className="kb-signin-form"
        noValidate
        onSubmit={async (e) => {
          e.preventDefault()
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setState({ error: 'Please enter a valid email address, like ada@example.com.', field: 'email' })
          setState({ busy: true })
          const website = (e.currentTarget.querySelector('input[name="website"]') as HTMLInputElement | null)?.value ?? ''
          const res = await fetch('/api/kb/email-link', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, name, next, website, startedAt: startedAt.current }) }).catch(() => null)
          const body = (await res?.json().catch(() => null)) as { ok?: boolean; error?: string; errors?: Record<string, string> } | null
          if (body?.ok) {
            setState({})
            setSent(true)
          } else if (body?.errors) {
            const [field, error] = Object.entries(body.errors)[0]
            setState({ error, field: field === 'name' ? 'name' : 'email' })
          } else setState({ error: body?.error ?? 'It could not be sent. Please try again.' })
        }}
      >
        <label className="cf-field">
          <span>Your email</span>
          <input type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ada@example.com" aria-invalid={state.field === 'email' || undefined} />
          {state.field === 'email' && state.error ? <em role="alert">{state.error}</em> : null}
        </label>
        <label className="cf-field">
          <span>
            Name on your comments <small>optional</small>
          </span>
          <input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="Ada Lovelace" aria-invalid={state.field === 'name' || undefined} />
          {state.field === 'name' && state.error ? <em role="alert">{state.error}</em> : null}
        </label>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="kb-hp" aria-hidden="true" />
        <button type="submit" className="btn ghost kb-signin-wide" disabled={state.busy}>
          {state.busy ? 'Sending…' : 'Email me a sign-in link'}
        </button>
        {state.error && !state.field ? <p className="kb-error">{state.error}</p> : null}
      </form>
      <p className="kb-signin-foot">
        Your email is never shown. <Link href="/privacy">Privacy</Link>
      </p>
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
    const done = () => setOpen(null)
    window.addEventListener('kb-signin', show)
    window.addEventListener('kb-signed-in', done)
    return () => {
      window.removeEventListener('kb-signin', show)
      window.removeEventListener('kb-signed-in', done)
    }
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
          <strong className="kb-signin-title">Sign in {open.why ?? 'to comment, like and rate'}</strong>
          <button type="button" className="kb-x" onClick={() => setOpen(null)} aria-label="Close">
            ×
          </button>
        </div>
        {open.problem ? <p className={open.problem.startsWith('Your account') ? 'kb-note' : 'kb-error'}>{open.problem}</p> : null}
        <SignInOptions why={open.why} heading={false} />
      </div>
    </div>,
    document.body,
  )
}
