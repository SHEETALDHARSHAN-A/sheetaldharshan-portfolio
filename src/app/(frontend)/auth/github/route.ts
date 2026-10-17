import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'
import { PURPOSE_COOKIE } from '@/utilities/secondFactor'
import { supabaseConfig } from '@/utilities/supabaseAuth'
import { supabaseForRoute } from '@/utilities/supabaseRoute'

/**
 * Starts the GitHub check: `?purpose=2fa` (second step after the password) or `?purpose=reset`
 * (forgotten password). Supabase sends the browser to GitHub, which returns to /auth/callback.
 */
export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin
  const purpose = request.nextUrl.searchParams.get('purpose') === 'reset' ? 'reset' : '2fa'
  const back = (status: string) => NextResponse.redirect(`${origin}/auth/verify?${purpose === 'reset' ? 'reset=1&' : ''}auth=${status}`)

  if (purpose === '2fa') {
    // The second step only follows a password sign-in.
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: await headers() })
    if (!user) return NextResponse.redirect(`${origin}/admin/login`)
  }

  const supabase = await supabaseForRoute()
  const cfg = supabaseConfig()
  if (!supabase || !cfg) return back('unavailable')
  const settings = (await fetch(`${cfg.url}/auth/v1/settings`, { headers: { apikey: cfg.anonKey }, cache: 'no-store' })
    .then((r) => r.json())
    .catch(() => null)) as { external?: { github?: boolean } } | null
  if (!settings?.external?.github) return back('unavailable')
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: `${origin}/auth/callback`, scopes: 'read:user user:email', skipBrowserRedirect: true },
  })
  if (error || !data.url) return back('unavailable')
  const res = NextResponse.redirect(data.url)
  res.cookies.set(PURPOSE_COOKIE, purpose, { httpOnly: true, secure: origin.startsWith('https'), sameSite: 'lax', path: '/auth', maxAge: 600 })
  return res
}
