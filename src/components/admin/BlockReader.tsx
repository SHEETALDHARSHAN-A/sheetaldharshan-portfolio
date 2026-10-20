'use client'

import { useFormFields } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

type ReaderInfo = { id: number; name: string; status?: string; provider?: string; githubLogin?: string }

/**
 * In a comment's or review's sidebar: who wrote it, and one click to block them (they are signed
 * out, cannot post, and everything they wrote is hidden) or unblock them again.
 */
export function BlockReader() {
  const value = useFormFields(([fields]) => fields.reader?.value as number | { id: number } | null | undefined)
  const id = typeof value === 'object' && value ? value.id : value
  const [reader, setReader] = useState<ReaderInfo | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/readers/${id}?depth=0`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: ReaderInfo | null) => setReader(d))
      .catch(() => undefined)
  }, [id])

  const box: React.CSSProperties = { margin: '0 0 20px', padding: '12px', borderRadius: 8, border: '1px solid var(--theme-elevation-150)', fontSize: 13, display: 'grid', gap: 8 }
  if (!id) return <div style={box}>Written anonymously (not signed in). Hide or delete the comment to remove it.</div>
  if (!reader) return <div style={box}>Loading the reader…</div>
  const blocked = reader.status === 'blocked'
  const set = async (status: 'active' | 'blocked') => {
    const reason = status === 'blocked' ? window.prompt(`Block ${reader.name}? They will be signed out, cannot post, and everything they wrote is hidden.\n\nWhy (only for you)?`, '') : ''
    if (reason === null) return
    setBusy(true)
    const res = await fetch(`/api/readers/${reader.id}`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, ...(status === 'blocked' ? { blockedReason: reason } : {}) }) }).catch(() => null)
    const body = (await res?.json().catch(() => null)) as { doc?: ReaderInfo } | null
    if (body?.doc) setReader(body.doc)
    setBusy(false)
  }
  return (
    <div style={box}>
      <span>
        Written by{' '}
        <a href={`/admin/collections/readers/${reader.id}`}>
          <strong>{reader.name}</strong>
        </a>{' '}
        ({reader.provider === 'github' ? `GitHub${reader.githubLogin ? ` @${reader.githubLogin}` : ''}` : 'email'}){blocked ? ' · blocked' : ''}
      </span>
      <button
        type="button"
        disabled={busy}
        onClick={() => void set(blocked ? 'active' : 'blocked')}
        style={{ justifySelf: 'start', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', font: 'inherit', border: `1px solid ${blocked ? 'var(--theme-elevation-250)' : 'var(--theme-error-500)'}`, background: 'transparent', color: blocked ? 'var(--theme-text)' : 'var(--theme-error-500)' }}
      >
        {busy ? 'Saving…' : blocked ? 'Unblock this reader' : 'Block this reader'}
      </button>
    </div>
  )
}
