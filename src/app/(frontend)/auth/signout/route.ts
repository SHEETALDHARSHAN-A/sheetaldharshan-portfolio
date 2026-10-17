import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { supabaseForRoute } from '@/utilities/supabaseRoute'

/** Ends both sessions (Supabase and Payload) and returns to the login page. */
export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin
  const supabase = await supabaseForRoute()
  await supabase?.auth.signOut().catch(() => undefined)
  ;(await cookies()).delete('payload-token')
  return NextResponse.redirect(`${origin}/admin/login`)
}
