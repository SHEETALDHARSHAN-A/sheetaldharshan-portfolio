import { AdminTheme } from './AdminBrand'

/** Above Payload's login form: sign-in is the password, then a GitHub check; forgotten passwords reset through GitHub. */
export function GitHubSignIn() {
  return (
    <div style={{ display: 'grid', gap: 6, marginBottom: 24, fontSize: 13, color: 'var(--theme-elevation-600)' }}>
      <AdminTheme />
      <p style={{ margin: 0 }}>Two-step sign-in: your password, then a quick GitHub check.</p>
      <p style={{ margin: 0 }}>
        Forgot your password?{' '}
        {/* A full page load on purpose: the reset starts with a redirect to GitHub. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/auth/verify?reset=1" style={{ color: 'var(--theme-success-500, #4caf50)' }}>
          Reset it with GitHub
        </a>
      </p>
    </div>
  )
}
