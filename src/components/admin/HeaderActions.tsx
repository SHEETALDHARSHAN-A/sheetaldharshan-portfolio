'use client'

import Link from 'next/link'
import { useState } from 'react'
import { downloadBackup } from './siteBackup'

/** Top bar, left of the account avatar: one-click full backup, and the import page. */
export function HeaderActions() {
  const [status, setStatus] = useState('')
  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: 28,
    padding: '0 10px',
    borderRadius: 'var(--style-radius-m, 4px)',
    border: '1px solid var(--theme-elevation-150)',
    background: 'transparent',
    color: 'var(--theme-text)',
    font: 'inherit',
    fontSize: 12.5,
    textDecoration: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginRight: 8 }}>
      <button
        type="button"
        style={base}
        disabled={Boolean(status)}
        title="Download everything (settings, content with drafts, and every image) as one .zip"
        onClick={() => {
          downloadBackup(setStatus).catch((e: Error) => {
            setStatus('')
            window.alert(e.message)
          })
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 3v12m0 0-4-4m4 4 4-4M4 17v3h16v-3" />
        </svg>
        {status || 'Export'}
      </button>
      <Link href="/admin/site-data" style={base} title="Import a backup or site.json">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 15V3m0 0L8 7m4-4 4 4M4 17v3h16v-3" />
        </svg>
        Import
      </Link>
    </span>
  )
}
