import configPromise from '@payload-config'
import { cookies, headers } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'
import { ADMIN_EMAILS } from '@/config/admin'
import { PURPOSE_COOKIE, SECOND_FACTOR_COOKIE, SECOND_FACTOR_SECONDS, signSecondFactor } from '@/utilities/secondFactor'
import { githubLogin, isAllowedAdmin } from '@/utilities/supabaseAuth'
import { supabaseForRoute } from '@/utilities/supabaseRoute'
import { finishSignIn, READER_NEXT_COOKIE, readerFromGitHub } from '@/utilities/readerSignIn'

/**
 * GitHub sends people back here. An allowlisted account either completes the second step of a
 * password sign-in, or (for a forgotten password) opens Payload's "set a new password" page.
 * The Supabase session is only a check, so it is ended straight away.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const store = await cookies()
  const raw = store.get(PURPOSE_COOKIE)?.value
  store.delete({ name: PURPOSE_COOKIE, path: '/auth' })
  if (raw === 'reader') return readerCallback(url, store.get(READER_NEXT_COOKIE)?.value ?? '/notes')
  const purpose = raw === 'reset' ? 'reset' : '2fa'
  const back = (status: string) => NextResponse.redirect(`${url.origin}/auth/verify?${purpose === 'reset' ? 'reset=1&' : ''}auth=${status}`)

  const code = url.searchParams.get('code')
  const supabase = await supabaseForRoute()
  if (!supabase || !code) return back('failed')
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) return back('failed')
  const { data } = await supabase.auth.getUser()
  await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined)
  const login = githubLogin(data.user)
  const payload = await getPayload({ config: configPromise })

  if (purpose === 'reset') {
    // The admin user linked to this GitHub account; otherwise the allowlist in src/config/admin.ts.
    const linked = login
      ? (await payload.find({ collection: 'users', where: { githubUsername: { equals: login } }, limit: 1, depth: 0, overrideAccess: true })).docs[0]
      : undefined
    let email = linked?.email
    if (!email) {
      if (!isAllowedAdmin(data.user)) return back('not-allowed')
      const githubEmail = String(data.user?.email ?? '').toLowerCase()
      email = ADMIN_EMAILS.includes(githubEmail) ? githubEmail : ADMIN_EMAILS[0]
    }
    const token = email ? await payload.forgotPassword({ collection: 'users', data: { email }, disableEmail: true }).catch(() => null) : null
    if (!token) return back('no-user')
    return NextResponse.redirect(`${url.origin}/admin/reset/${encodeURIComponent(token)}`)
  }

  const { user } = await payload.auth({ headers: await headers() })
  if (!user) return NextResponse.redirect(`${url.origin}/admin/login`)
  // Each person confirms with their own GitHub account; users without one use the allowlist.
  const linkedLogin = String((user as { githubUsername?: string | null }).githubUsername ?? '').toLowerCase()
  if (linkedLogin ? linkedLogin !== login : !isAllowedAdmin(data.user)) return back('not-allowed')
  const res = NextResponse.redirect(`${url.origin}/admin`)
  res.cookies.set(SECOND_FACTOR_COOKIE, await signSecondFactor(user.id, (user as { _sid?: string })._sid), {
    httpOnly: true,
    secure: url.protocol === 'https:',
    sameSite: 'lax',
    path: '/',
    maxAge: SECOND_FACTOR_SECONDS,
  })
  return res
}

/** A Field Notes reader coming back from GitHub: signed in to comment, never to the admin. */
async function readerCallback(url: URL, next: string) {
  const supabase = await supabaseForRoute()
  const code = url.searchParams.get('code')
  if (!supabase || !code) return finishSignIn(url.origin, next, null)
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) return finishSignIn(url.origin, next, null)
  const { data } = await supabase.auth.getUser()
  // The Supabase session is only used to learn who they are on GitHub.
  await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined)
  if (!data.user) return finishSignIn(url.origin, next, null)
  const payload = await getPayload({ config: configPromise })
  const res = finishSignIn(url.origin, next, await readerFromGitHub(payload, data.user))
  res.cookies.delete({ name: READER_NEXT_COOKIE, path: '/auth' })
  return res
}
