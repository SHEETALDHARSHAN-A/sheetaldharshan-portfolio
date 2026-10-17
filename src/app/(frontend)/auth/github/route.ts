import { NextResponse, type NextRequest } from 'next/server'
import { supabaseConfig } from '@/utilities/supabaseAuth'
import { supabaseForRoute } from '@/utilities/supabaseRoute'

/** Starts "Sign in with GitHub": Supabase sends the browser to GitHub, which returns to /auth/callback. */
export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin
  const supabase = await supabaseForRoute()
  const cfg = supabaseConfig()
  if (!supabase || !cfg) return NextResponse.redirect(`${origin}/admin/login?auth=unavailable`)
  // If GitHub is not switched on in Supabase yet, say so on the login page instead of Supabase's error.
  const settings = (await fetch(`${cfg.url}/auth/v1/settings`, { headers: { apikey: cfg.anonKey }, next: { revalidate: 300 } })
    .then((r) => r.json())
    .catch(() => null)) as { external?: { github?: boolean } } | null
  if (!settings?.external?.github) return NextResponse.redirect(`${origin}/admin/login?auth=unavailable`)
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: `${origin}/auth/callback`, scopes: 'read:user user:email', skipBrowserRedirect: true },
  })
  if (error || !data.url) return NextResponse.redirect(`${origin}/admin/login?auth=unavailable`)
  return NextResponse.redirect(data.url)
}
