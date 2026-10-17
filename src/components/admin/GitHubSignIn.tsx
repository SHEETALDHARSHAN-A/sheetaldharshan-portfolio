'use client'

import { useSearchParams } from 'next/navigation'

const MESSAGES: Record<string, string> = {
  'not-allowed': 'That GitHub account is not allowed into this admin.',
  failed: 'GitHub sign-in did not finish. Please try again.',
  unavailable: 'GitHub sign-in is not set up yet. Use your email and password below.',
}

/** "Sign in with GitHub" above Payload's login form, which stays as the backup way in. */
export function GitHubSignIn() {
  const status = useSearchParams()?.get('auth')
  return (
    <div style={{ display: 'grid', gap: 12, marginBottom: 28 }}>
      {/* A full page load on purpose: this route redirects to GitHub, which client-side navigation cannot follow. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a
        href="/auth/github"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          height: 44,
          borderRadius: 8,
          background: '#24292f',
          color: '#fff',
          fontWeight: 600,
          textDecoration: 'none',
          border: '1px solid rgba(255,255,255,.15)',
        }}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
          <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 0-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.3-3.1-.2-.4-.6-1.6 0-3.2 0 0 1-.3 3.4 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.2.8.8 1.3 1.9 1.3 3.2 0 4.6-2.8 5.6-5.5 5.9.5.4.9 1.1.9 2.2v3.3c0 .3.1.7.8.6A12 12 0 0 0 12 .3" />
        </svg>
        Sign in with GitHub
      </a>
      {status && MESSAGES[status] ? (
        <p role="alert" style={{ margin: 0, padding: '10px 12px', borderRadius: 8, background: 'var(--theme-error-100, #3b1a1a)', color: 'var(--theme-error-750, #ffb4b4)', fontSize: 13 }}>
          {MESSAGES[status]}
        </p>
      ) : null}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--theme-elevation-500)', fontSize: 12 }}>
        <span style={{ flex: 1, height: 1, background: 'var(--theme-elevation-150)' }} />
        or use the backup email and password
        <span style={{ flex: 1, height: 1, background: 'var(--theme-elevation-150)' }} />
      </div>
    </div>
  )
}
