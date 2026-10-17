import { createServerClient, parseCookieHeader, serializeCookieHeader, type CookieOptions } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'
import { ADMIN_EMAILS, ADMIN_GITHUB_USERS } from '@/config/admin'

/**
 * The Supabase project behind the site. SUPABASE_URL / SUPABASE_ANON_KEY win; otherwise they are read
 * from the storage settings, which already hold the same project and its public (anon) key.
 */
export function supabaseConfig(): { url: string; anonKey: string } | null {
  const url = process.env.SUPABASE_URL || (() => {
    const host = (process.env.S3_ENDPOINT || '').match(/^https?:\/\/([a-z0-9]+)\.(storage\.)?supabase\.co/i)?.[1]
    return host ? `https://${host}.supabase.co` : ''
  })()
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.S3_SECRET_ACCESS_KEY || ''
  return url && anonKey ? { url, anonKey } : null
}

/** True when the signed-in Supabase user is on the admin allowlist. */
export function isAllowedAdmin(user: User | null | undefined): boolean {
  if (!user) return false
  const login = String(user.user_metadata?.user_name ?? user.user_metadata?.preferred_username ?? '').toLowerCase()
  const emails = [user.email, user.user_metadata?.email].filter(Boolean).map((e) => String(e).toLowerCase())
  return ADMIN_GITHUB_USERS.some((u) => u.toLowerCase() === login) || emails.some((e) => ADMIN_EMAILS.includes(e))
}

/** A Supabase client over a raw Cookie header, collecting any refreshed cookies to send back. */
export function supabaseFromHeader(cookieHeader: string) {
  const cfg = supabaseConfig()
  if (!cfg) return null
  const outgoing: string[] = []
  const client = createServerClient(cfg.url, cfg.anonKey, {
    cookies: {
      getAll: () => parseCookieHeader(cookieHeader).map((c) => ({ name: c.name, value: c.value ?? '' })),
      setAll: (list: { name: string; value: string; options: CookieOptions }[]) => {
        for (const { name, value, options } of list) outgoing.push(serializeCookieHeader(name, value, options))
      },
    },
  })
  return { client, outgoing }
}
