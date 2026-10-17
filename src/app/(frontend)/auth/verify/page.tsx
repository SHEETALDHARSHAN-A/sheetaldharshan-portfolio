import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Confirm it’s you', robots: { index: false, follow: false } }

const MESSAGES: Record<string, string> = {
  'not-allowed': 'That GitHub account is not linked to this admin user. Sign out of GitHub and use the account set under Admin users → GitHub username.',
  failed: 'The GitHub check did not finish. Please try again.',
  unavailable: 'GitHub is not set up for the admin yet. Run pnpm admin:reset-password on your machine instead.',
  'no-user': 'No admin account matches that GitHub account.',
}

const card: React.CSSProperties = {
  width: 'min(420px, calc(100vw - 32px))',
  margin: '18vh auto 0',
  padding: 28,
  borderRadius: 16,
  background: 'var(--bg-elevated)',
  border: '1px solid var(--line)',
  color: 'var(--text)',
  display: 'grid',
  gap: 14,
}

/** Step two of the admin sign-in, and the start of a password reset: both go through GitHub. */
export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ reset?: string; auth?: string }> }) {
  const { reset, auth } = await searchParams
  const isReset = reset === '1'
  if (!isReset) {
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: await headers() })
    if (!user) redirect('/admin/login')
  }
  const message = auth ? MESSAGES[auth] : undefined
  return (
    <main id="main" style={card}>
      <p style={{ margin: 0, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>{isReset ? 'Forgot password' : 'Step 2 of 2'}</p>
      <h1 style={{ margin: 0, fontSize: 24 }}>{isReset ? 'Reset your password with GitHub' : 'Confirm it’s you with GitHub'}</h1>
      <p style={{ margin: 0, color: 'var(--text-soft)', lineHeight: 1.5 }}>
        {isReset
          ? 'Sign in to the GitHub account linked to this admin, then choose a new password.'
          : 'Your password was right. Finish signing in with the GitHub account linked to this admin.'}
      </p>
      {message ? (
        <p role="alert" style={{ margin: 0, padding: '10px 12px', borderRadius: 8, background: 'rgba(255, 80, 80, 0.12)', color: '#ffb4b4', fontSize: 14 }}>
          {message}
        </p>
      ) : null}
      {/* Full page loads on purpose: these routes redirect to GitHub and clear cookies. */}
      <a
        href={`/auth/github?purpose=${isReset ? 'reset' : '2fa'}`}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, height: 44, borderRadius: 10, background: '#24292f', color: '#fff', fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,.15)' }}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
          <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 0-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.3-3.1-.2-.4-.6-1.6 0-3.2 0 0 1-.3 3.4 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.2.8.8 1.3 1.9 1.3 3.2 0 4.6-2.8 5.6-5.5 5.9.5.4.9 1.1.9 2.2v3.3c0 .3.1.7.8.6A12 12 0 0 0 12 .3" />
        </svg>
        Continue with GitHub
      </a>
      <a href={isReset ? '/admin/login' : '/auth/signout'} style={{ justifySelf: 'center', fontSize: 14, color: 'var(--muted)' }}>
        {isReset ? 'Back to sign in' : 'Cancel and sign out'}
      </a>
    </main>
  )
}
