'use client'

import { useAllFormFields } from '@payloadcms/ui'
import { reduceFieldsToValues } from 'payload/shared'
import { useState } from 'react'

const EMAIL_KEYS = ['notifyEmail', 'fromName', 'fromEmail', 'emailAccent', 'alertEmail', 'confirm', 'confirmEmail']

/** Sends a sample email built from the settings on screen (saved or not) and says how it went. */
export function SendTestEmail({ kind = 'alert' }: { kind?: 'alert' | 'confirm' }) {
  const [fields] = useAllFormFields()
  const [state, setState] = useState<{ busy: boolean; message?: string; ok?: boolean }>({ busy: false })
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <button
        type="button"
        disabled={state.busy}
        onClick={async () => {
          setState({ busy: true })
          const all = reduceFieldsToValues(fields, true) as Record<string, unknown>
          const draft = Object.fromEntries(EMAIL_KEYS.filter((k) => k in all).map((k) => [k, all[k]]))
          const res = await fetch('/api/contact-test', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ kind, draft }),
          }).catch(() => null)
          const body = (await res?.json().catch(() => null)) as { ok?: boolean; message?: string } | null
          setState({ busy: false, ok: Boolean(body?.ok), message: body?.message ?? 'Could not reach the server.' })
        }}
        style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--theme-elevation-250)', background: 'transparent', color: 'var(--theme-text)', cursor: 'pointer', font: 'inherit' }}
      >
        {state.busy ? 'Sending…' : kind === 'confirm' ? 'Send me a sample "thanks" email' : 'Send me a sample alert'}
      </button>
      {state.message ? <span style={{ color: state.ok ? 'var(--theme-success-500)' : 'var(--theme-error-500)' }}>{state.message}</span> : null}
    </span>
  )
}
