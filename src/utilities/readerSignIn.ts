import type { User } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { Payload } from 'payload'
import { moderate } from './moderation'
import { READER_COOKIE, safeNext, SESSION_DAYS, signReader, upsertReader, type ReaderDoc } from './readerSession'

/** Where a reader returns after GitHub, kept in a short-lived cookie during the round trip. */
export const READER_NEXT_COOKIE = 'reader-next'

/** Sends the reader back to the page they came from, signed in (or with a reason why not). */
export function finishSignIn(origin: string, next: string, doc: ReaderDoc | null, problem?: string, status = 307): NextResponse {
  const target = new URL(safeNext(next), origin)
  if (!doc || doc.status === 'blocked') {
    target.searchParams.set('signin', doc?.status === 'blocked' ? 'blocked' : problem || 'failed')
    return NextResponse.redirect(target, status)
  }
  const res = NextResponse.redirect(target, status)
  // Through the cookies API (not a raw header), so later res.cookies changes keep it.
  res.cookies.set(READER_COOKIE, signReader(doc), { httpOnly: true, secure: origin.startsWith('https'), sameSite: 'lax', path: '/', maxAge: SESSION_DAYS * 86400 })
  return res
}

/** A GitHub account (through Supabase) → the matching reader, created on first sign-in. */
export function readerFromGitHub(payload: Payload, user: User): Promise<ReaderDoc> {
  const meta = user.user_metadata ?? {}
  const login = String(meta.user_name ?? meta.preferred_username ?? '')
  const githubId = String(user.identities?.find((i) => i.provider === 'github')?.id ?? meta.provider_id ?? meta.sub ?? user.id)
  // A display name that fails the abuse check falls back to the GitHub username.
  const full = String(meta.full_name || meta.name || '').trim()
  const name = full && moderate(full).action === 'publish' ? full : login || 'GitHub reader'
  const avatar = typeof meta.avatar_url === 'string' && /^https:\/\/[a-z0-9.-]*githubusercontent\.com\//i.test(meta.avatar_url) ? meta.avatar_url : undefined
  return upsertReader(payload, {
    provider: 'github',
    providerId: githubId,
    email: user.email ?? meta.email,
    name,
    avatar,
    githubLogin: login,
  })
}
