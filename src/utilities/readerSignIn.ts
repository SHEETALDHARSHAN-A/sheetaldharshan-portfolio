import type { User } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { Payload } from 'payload'
import { safeNext, sessionCookie, signReader, upsertReader, type ReaderDoc } from './readerSession'

/** Where a reader returns after GitHub, kept in a short-lived cookie during the round trip. */
export const READER_NEXT_COOKIE = 'reader-next'

/** Sends the reader back to the page they came from, signed in (or with a reason why not). */
export function finishSignIn(origin: string, next: string, doc: ReaderDoc | null, problem?: string): NextResponse {
  const target = new URL(safeNext(next), origin)
  if (!doc || doc.status === 'blocked') {
    target.searchParams.set('signin', doc?.status === 'blocked' ? 'blocked' : problem || 'failed')
    return NextResponse.redirect(target)
  }
  const res = NextResponse.redirect(target)
  res.headers.append('Set-Cookie', sessionCookie(signReader(doc), origin.startsWith('https')))
  return res
}

/** A GitHub account (through Supabase) → the matching reader, created on first sign-in. */
export function readerFromGitHub(payload: Payload, user: User): Promise<ReaderDoc> {
  const meta = user.user_metadata ?? {}
  const login = String(meta.user_name ?? meta.preferred_username ?? '')
  const githubId = String(user.identities?.find((i) => i.provider === 'github')?.id ?? meta.provider_id ?? meta.sub ?? user.id)
  return upsertReader(payload, {
    provider: 'github',
    providerId: githubId,
    email: user.email ?? meta.email,
    name: String(meta.full_name || meta.name || login || 'GitHub reader'),
    avatar: typeof meta.avatar_url === 'string' ? meta.avatar_url : undefined,
    githubLogin: login,
  })
}
