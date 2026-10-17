import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseConfig } from './supabaseAuth'

/** A Supabase client for route handlers, reading and writing the request's cookies. */
export async function supabaseForRoute() {
  const cfg = supabaseConfig()
  if (!cfg) return null
  const store = await cookies()
  return createServerClient(cfg.url, cfg.anonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list: { name: string; value: string; options: CookieOptions }[]) => {
        for (const { name, value, options } of list) store.set(name, value, options)
      },
    },
  })
}
