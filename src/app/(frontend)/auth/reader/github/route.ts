import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse, type NextRequest } from 'next/server'
import { PURPOSE_COOKIE } from '@/utilities/secondFactor'
import { supabaseForRoute } from '@/utilities/supabaseRoute'
import { safeNext } from '@/utilities/readerSession'
import { READER_NEXT_COOKIE } from '@/utilities/readerSignIn'

/**
 * ./stdout sign-in with GitHub. Uses the same Supabase GitHub app and /auth/callback as the
 * admin's GitHub step, so no extra setup is needed; the purpose cookie tells the callback it is a
 * reader signing in, and `next` brings them back to the post they were reading.
 */
export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin
  const next = safeNext(request.nextUrl.searchParams.get('next'))
  const payload = await getPayload({ config: configPromise })
  const settings = (await payload.findGlobal({ slug: 'kb-settings' as never, depth: 0 }).catch(() => ({}))) as { signIn?: boolean }
  const supabase = settings.signIn === false ? null : await supabaseForRoute()
  const fail = () => NextResponse.redirect(new URL(`${next}${next.includes('?') ? '&' : '?'}signin=unavailable`, origin))
  if (!supabase) return fail()
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: `${origin}/auth/callback`, scopes: 'read:user user:email', skipBrowserRedirect: true } })
  if (error || !data.url) return fail()
  const res = NextResponse.redirect(data.url)
  const opts = { httpOnly: true, secure: origin.startsWith('https'), sameSite: 'lax' as const, path: '/auth', maxAge: 600 }
  res.cookies.set(PURPOSE_COOKIE, 'reader', opts)
  res.cookies.set(READER_NEXT_COOKIE, next, opts)
  return res
}
