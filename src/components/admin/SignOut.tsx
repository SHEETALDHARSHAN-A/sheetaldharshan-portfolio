/** Sign-out in the admin menu: ends the GitHub (Supabase) session and Payload's, then shows the login page. */
export function SignOut() {
  return (
    // A full page load on purpose: the route clears both sessions' cookies before showing the login page.
    // eslint-disable-next-line @next/next/no-html-link-for-pages
    <a href="/auth/signout" title="Sign out" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--theme-elevation-800)', textDecoration: 'none' }}>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H4" />
      </svg>
      Sign out
    </a>
  )
}
