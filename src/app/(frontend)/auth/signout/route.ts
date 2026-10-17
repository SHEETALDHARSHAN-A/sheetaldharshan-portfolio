import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { SECOND_FACTOR_COOKIE } from '@/utilities/secondFactor'

/** Ends the admin session (password and GitHub step) and returns to the login page. */
export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin
  const store = await cookies()
  store.delete('payload-token')
  store.delete(SECOND_FACTOR_COOKIE)
  return NextResponse.redirect(`${origin}/admin/login`)
}
