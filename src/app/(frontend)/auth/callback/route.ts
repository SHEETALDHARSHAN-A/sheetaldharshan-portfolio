import configPromise from '@payload-config'
import { cookies, headers } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'
import { ADMIN_EMAILS } from '@/config/admin'
import { PURPOSE_COOKIE, SECOND_FACTOR_COOKIE, SECOND_FACTOR_SECONDS, signSecondFactor } from '@/utilities/secondFactor'
import { isAllowedAdmin } from '@/utilities/supabaseAuth'
import { supabaseForRoute } from '@/utilities/supabaseRoute'

/**
 * GitHub sends people back here. An allowlisted account either completes the second step of a
 * password sign-in, or (for a forgotten password) opens Payload's "set a new password" page.
 * The Supabase session is only a check, so it is ended straight away.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const store = await cookies()
  const purpose = store.get(PURPOSE_COOKIE)?.value === 'reset' ? 'reset' : '2fa'
  store.delete({ name: PURPOSE_COOKIE, path: '/auth' })
  const back = (status: string) => NextResponse.redirect(`${url.origin}/auth/verify?${purpose === 'reset' ? 'reset=1&' : ''}auth=${status}`)

  const code = url.searchParams.get('code')
  const supabase = await supabaseForRoute()
  if (!supabase || !code) return back('failed')
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) return back('failed')
  const { data } = await supabase.auth.getUser()
  await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined)
  if (!isAllowedAdmin(data.user)) return back('not-allowed')

  const payload = await getPayload({ config: configPromise })
  if (purpose === 'reset') {
    const githubEmail = String(data.user?.email ?? '').toLowerCase()
    const email = ADMIN_EMAILS.includes(githubEmail) ? githubEmail : ADMIN_EMAILS[0]
    const token = email ? await payload.forgotPassword({ collection: 'users', data: { email }, disableEmail: true }).catch(() => null) : null
    if (!token) return back('no-user')
    return NextResponse.redirect(`${url.origin}/admin/reset/${encodeURIComponent(token)}`)
  }

  const { user } = await payload.auth({ headers: await headers() })
  if (!user) return NextResponse.redirect(`${url.origin}/admin/login`)
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
