'use client'

import { useState } from 'react'

/** Sends one test alert to the configured address and says how it went. */
export function SendTestEmail() {
  const [state, setState] = useState<{ busy: boolean; message?: string; ok?: boolean }>({ busy: false })
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <button
        type="button"
        disabled={state.busy}
        onClick={async () => {
          setState({ busy: true })
          const res = await fetch('/api/contact-test', { method: 'POST', credentials: 'include' }).catch(() => null)
          const body = (await res?.json().catch(() => null)) as { ok?: boolean; message?: string } | null
          setState({ busy: false, ok: Boolean(body?.ok), message: body?.message ?? 'Could not reach the server.' })
        }}
        style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--theme-elevation-250)', background: 'transparent', color: 'var(--theme-text)', cursor: 'pointer', font: 'inherit' }}
      >
        {state.busy ? 'Sending…' : 'Send test email'}
      </button>
      {state.message ? <span style={{ color: state.ok ? 'var(--theme-success-500)' : 'var(--theme-error-500)' }}>{state.message}</span> : null}
    </span>
  )
}
