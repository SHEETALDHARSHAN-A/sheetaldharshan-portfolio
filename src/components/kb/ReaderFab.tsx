'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Avatar } from './Avatar'
import { VerifiedTick } from './Author'
import { useReader } from './reader'

/**
 * A signed-in reader's picture, floating at the right edge. It opens their account menu: their page
 * (stars, comments, likes, reports), sign out here, or sign out on every device.
 */
export function ReaderFab() {
  const { reader, signOut } = useReader()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const away = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false)
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', away)
    window.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', away)
      window.removeEventListener('keydown', esc)
    }
  }, [open])

  if (!reader) return null
  const out = async (everywhere: boolean) => {
    if (everywhere && !window.confirm('Sign out on every device where you are signed in?')) return
    setBusy(true)
    await signOut(everywhere)
    setBusy(false)
    setOpen(false)
  }
  return (
    <div className="kb-fab-wrap" ref={box}>
      <button type="button" className="kb-fab" aria-haspopup="menu" aria-expanded={open} aria-label={`Account: ${reader.name}`} onClick={() => setOpen((o) => !o)}>
        <Avatar name={reader.name} src={reader.avatar} size={44} />
        {reader.verified ? (
          <span className="kb-fab-tick">
            <VerifiedTick size={16} />
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="kb-menu" role="menu">
          <div className="kb-menu-who">
            <strong>
              {reader.name} {reader.verified ? <VerifiedTick size={13} /> : null}
            </strong>
            <span>{reader.verified ? `GitHub${reader.github ? ` · @${reader.github}` : ''}` : 'Signed in with email'}</span>
          </div>
          <Link href="/notes/me" role="menuitem" onClick={() => setOpen(false)}>
            Your page: stars, comments, likes, reports
          </Link>
          <button type="button" role="menuitem" disabled={busy} onClick={() => void out(false)}>
            Sign out
          </button>
          <button type="button" role="menuitem" disabled={busy} className="kb-menu-danger" onClick={() => void out(true)}>
            Sign out on all devices
          </button>
        </div>
      ) : null}
    </div>
  )
}
