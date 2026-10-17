import { supabaseConfig } from './supabaseAuth'

/**
 * The admin's second step. A password login gives a Payload session; it only counts once GitHub has
 * confirmed an allowlisted account, which leaves this signed cookie tied to that user and session.
 */
export const SECOND_FACTOR_COOKIE = 'admin-2fa'
export const SECOND_FACTOR_SECONDS = 12 * 60 * 60
/** Remembers whether a GitHub round trip is the second step or a password reset. */
export const PURPOSE_COOKIE = 'admin-github-purpose'

const enc = new TextEncoder()

const b64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

async function sign(body: string): Promise<string> {
  const secret = process.env.PAYLOAD_SECRET
  if (!secret) throw new Error('PAYLOAD_SECRET is not set')
  const key = await crypto.subtle.importKey('raw', enc.encode(`admin-2fa:${secret}`), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return b64url(new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(body))))
}

export async function signSecondFactor(userId: string | number, sid?: string | null): Promise<string> {
  const body = `${userId}.${sid ?? ''}.${Date.now() + SECOND_FACTOR_SECONDS * 1000}`
  return `${body}.${await sign(body)}`
}

export async function verifySecondFactor(value: string | undefined, userId: string | number, sid?: string | null): Promise<boolean> {
  const parts = value?.split('.') ?? []
  if (parts.length !== 4) return false
  const [id, s, exp, sig] = parts
  if (id !== String(userId) || s !== (sid ?? '') || !(Number(exp) > Date.now())) return false
  const expected = await sign(`${id}.${s}.${exp}`).catch(() => '')
  if (!expected || expected.length !== sig.length) return false
  let diff = 0
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i)
  return diff === 0
}

/** The user id and session id inside a Payload token. Payload verifies the signature itself. */
export function tokenClaims(token: string): { id?: string; sid?: string } {
  try {
    const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const claims = JSON.parse(atob(part.padEnd(part.length + ((4 - (part.length % 4)) % 4), '='))) as { id?: unknown; sid?: unknown }
    return { id: claims.id == null ? undefined : String(claims.id), sid: typeof claims.sid === 'string' ? claims.sid : undefined }
  } catch {
    return {}
  }
}

let githubState: { on: boolean; at: number } | null = null
let switchState: { on: boolean; at: number } | null = null

/** The admin's on/off switch (Admin panel → Sign-in & security), checked at most every 30 s. On when unsure. */
async function switchedOn(origin: string): Promise<boolean> {
  if (switchState && Date.now() - switchState.at < 30 * 1000) return switchState.on
  let on = true
  try {
    const res = await fetch(`${origin}/api/globals/admin-security?depth=0`, { signal: AbortSignal.timeout(3000), cache: 'no-store' })
    if (res.ok) on = ((await res.json()) as { githubStep?: boolean | null }).githubStep !== false
  } catch {
    on = true
  }
  switchState = { on, at: Date.now() }
  return on
}

/**
 * Whether the GitHub step is enforced: when the admin switch is on and GitHub is enabled in Supabase
 * (so the admin is never locked out before that setup). ADMIN_2FA=off switches it off in an
 * emergency. When either check cannot be made it stays on.
 */
export async function secondFactorRequired(origin?: string): Promise<boolean> {
  if (process.env.ADMIN_2FA === 'off') return false
  if (origin && !(await switchedOn(origin))) return false
  const cfg = supabaseConfig()
  if (!cfg) return false
  if (githubState && Date.now() - githubState.at < 5 * 60 * 1000) return githubState.on
  let on = true
  try {
    const res = await fetch(`${cfg.url}/auth/v1/settings`, { headers: { apikey: cfg.anonKey }, signal: AbortSignal.timeout(3000), cache: 'no-store' })
    if (res.ok) on = Boolean(((await res.json()) as { external?: { github?: boolean } })?.external?.github)
  } catch {
    on = true
  }
  githubState = { on, at: Date.now() }
  return on
}
