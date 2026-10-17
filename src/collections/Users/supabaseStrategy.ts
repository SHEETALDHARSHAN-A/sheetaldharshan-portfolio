import type { AuthStrategy } from 'payload'
import { ADMIN_EMAILS } from '@/config/admin'
import { isAllowedAdmin, supabaseFromHeader } from '@/utilities/supabaseAuth'

/**
 * Admin sign-in through Supabase Auth (GitHub). A valid Supabase session for an allowlisted person
 * signs them in as the matching admin user. Payload's own email/password login stays as a backup.
 */
export const supabaseStrategy: AuthStrategy = {
  name: 'supabase',
  authenticate: async ({ headers, payload }) => {
    const cookieHeader = headers.get('cookie') ?? ''
    if (!/sb-[a-z0-9]+-auth-token/.test(cookieHeader)) return { user: null }
    const sb = supabaseFromHeader(cookieHeader)
    if (!sb) return { user: null }
    const { data } = await sb.client.auth.getUser()
    if (!isAllowedAdmin(data.user)) return { user: null }
    const emails = [data.user?.email, ...ADMIN_EMAILS].filter((e): e is string => Boolean(e)).map((e) => e.toLowerCase())
    const found = await payload.find({ collection: 'users', where: { email: { in: emails } }, limit: 1, depth: 0, overrideAccess: true })
    const doc = found.docs[0]
    if (!doc) return { user: null }
    const responseHeaders = new Headers()
    for (const cookie of sb.outgoing) responseHeaders.append('Set-Cookie', cookie)
    return { user: { ...doc, collection: 'users', _strategy: 'supabase' }, responseHeaders }
  },
}
