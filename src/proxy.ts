import { NextResponse, type NextRequest } from 'next/server'
import { SECOND_FACTOR_COOKIE, secondFactorRequired, tokenClaims, verifySecondFactor } from '@/utilities/secondFactor'

// Admin pages that work before (or without) the GitHub step.
const OPEN_ADMIN = /^\/admin\/(login|logout|reset|create-first-user|unauthorized)(\/|$)/

/**
 * Two-step admin sign-in. A password session without a matching GitHub confirmation is hidden from
 * Payload (the admin, its API and previews), and admin pages send the person to the GitHub step.
 * Forgotten passwords are reset through GitHub too.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname === '/admin/forgot' || pathname.startsWith('/admin/forgot/')) {
    return NextResponse.redirect(new URL('/auth/verify?reset=1', request.url))
  }
  const token = request.cookies.get('payload-token')?.value
  // The /auth routes check the password session themselves before starting the GitHub step.
  if (!token || pathname.startsWith('/auth/') || !(await secondFactorRequired(request.nextUrl.origin))) return NextResponse.next()

  const { id, sid } = tokenClaims(token)
  if (id && (await verifySecondFactor(request.cookies.get(SECOND_FACTOR_COOKIE)?.value, id, sid))) return NextResponse.next()

  if (request.method === 'GET' && pathname.startsWith('/admin') && !OPEN_ADMIN.test(pathname)) {
    return NextResponse.redirect(new URL('/auth/verify', request.url))
  }
  const headers = new Headers(request.headers)
  const cookie = (request.headers.get('cookie') ?? '')
    .split(/;\s*/)
    .filter((part) => part && !part.startsWith('payload-token='))
    .join('; ')
  if (cookie) headers.set('cookie', cookie)
  else headers.delete('cookie')
  return NextResponse.next({ request: { headers } })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|pet/|favicon|.*\\.(?:png|jpe?g|webp|gif|svg|ico|woff2?|css|js|map|txt|xml)$).*)'],
}
