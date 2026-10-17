import { NextResponse, type NextRequest } from 'next/server'
import { isAllowedAdmin } from '@/utilities/supabaseAuth'
import { supabaseForRoute } from '@/utilities/supabaseRoute'

/** GitHub sends people back here. Allowlisted people continue to the admin; anyone else is signed out. */
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const supabase = await supabaseForRoute()
  if (!supabase || !code) return NextResponse.redirect(`${url.origin}/admin/login?auth=failed`)
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) return NextResponse.redirect(`${url.origin}/admin/login?auth=failed`)
  const { data } = await supabase.auth.getUser()
  if (!isAllowedAdmin(data.user)) {
    await supabase.auth.signOut()
    return NextResponse.redirect(`${url.origin}/admin/login?auth=not-allowed`)
  }
  return NextResponse.redirect(`${url.origin}/admin`)
}
