import { NextResponse, type NextRequest } from 'next/server'
import { SEEN_HOME_COOKIE } from '@/components/home/HomeGate.shared'

/**
 * The homepage intro plays once per browser session. After a visitor has left it, a full load of
 * "/" (typing the address, reloading, Back after a full navigation) goes to /projects instead.
 * The cookie has no expiry, so it ends when the browser closes. Draft previews are never redirected.
 */
export function proxy(request: NextRequest) {
  const seen = request.cookies.get(SEEN_HOME_COOKIE)?.value === '1'
  const previewing = request.cookies.has('__prerender_bypass')
  if (seen && !previewing) return NextResponse.redirect(new URL('/projects', request.url), 307)
  return NextResponse.next()
}

export const config = { matcher: ['/'] }
