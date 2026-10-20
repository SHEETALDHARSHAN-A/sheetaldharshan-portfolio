import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import type { Payload } from 'payload'

/**
 * ./stdout reader sessions. A reader signs in with GitHub or an emailed link; the server then
 * sets a signed token (a JWT, HS256) in an httpOnly cookie. The token names the reader and their
 * session version, so raising `sessionVersion` in the admin (or blocking them) signs them out
 * everywhere at once. Tokens last 30 days and are renewed while the reader keeps visiting.
 */

export const READER_COOKIE = 'reader_session'
export const SESSION_DAYS = 30
const RENEW_AFTER_DAYS = 7

export type ReaderDoc = { id: number; name: string; email?: string | null; avatar?: string | null; provider: string; githubLogin?: string | null; status?: string | null; sessionVersion?: number | null }
/** What others see: GitHub readers are verified (blue tick) and link to their GitHub profile. */
export type Reader = { id: number; name: string; avatar?: string; provider: string; verified: boolean; github?: string }

const b64 = (data: Buffer | string) => Buffer.from(data).toString('base64url')
const key = () => {
  const secret = process.env.PAYLOAD_SECRET
  if (!secret) throw new Error('PAYLOAD_SECRET is not set')
  // A key of its own, so a reader token can never pass as an admin token or the other way round.
  return createHmac('sha256', secret).update('field-notes-reader-session').digest()
}

type Claims = { sub: string; sv: number; iat: number; exp: number; typ: 'reader' }

export function signReader(reader: Pick<ReaderDoc, 'id' | 'sessionVersion'>): string {
  const now = Math.floor(Date.now() / 1000)
  const claims: Claims = { sub: String(reader.id), sv: reader.sessionVersion ?? 1, iat: now, exp: now + SESSION_DAYS * 86400, typ: 'reader' }
  const body = `${b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${b64(JSON.stringify(claims))}`
  return `${body}.${b64(createHmac('sha256', key()).update(body).digest())}`
}

function verify(token: string): Claims | null {
  const [h, p, s] = token.split('.')
  if (!h || !p || !s) return null
  const expected = createHmac('sha256', key()).update(`${h}.${p}`).digest()
  const given = Buffer.from(s, 'base64url')
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null
  try {
    const header = JSON.parse(Buffer.from(h, 'base64url').toString()) as { alg?: string }
    const claims = JSON.parse(Buffer.from(p, 'base64url').toString()) as Claims
    if (header.alg !== 'HS256' || claims.typ !== 'reader' || claims.exp < Date.now() / 1000) return null
    return claims
  } catch {
    return null
  }
}

export function sessionCookie(token: string, secure: boolean): string {
  return `${READER_COOKIE}=${token}; Path=/; Max-Age=${SESSION_DAYS * 86400}; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`
}
export const clearCookie = (secure: boolean) => `${READER_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`

const cookieValue = (cookieHeader: string | null) => (cookieHeader ?? '').match(new RegExp(`(?:^|;\\s*)${READER_COOKIE}=([^;]+)`))?.[1]

/** The signed-in reader for a request, or null. Also says when the token should be renewed. */
export async function readerFromCookie(payload: Payload, cookieHeader: string | null): Promise<{ reader: Reader; doc: ReaderDoc; renew: boolean } | null> {
  const token = cookieValue(cookieHeader)
  const claims = token ? verify(token) : null
  if (!claims) return null
  const doc = (await payload.findByID({ collection: 'readers' as never, id: Number(claims.sub), depth: 0, overrideAccess: true }).catch(() => null)) as ReaderDoc | null
  if (!doc || doc.status === 'blocked' || (doc.sessionVersion ?? 1) !== claims.sv) return null
  return { reader: publicReader(doc), doc, renew: Date.now() / 1000 - claims.iat > RENEW_AFTER_DAYS * 86400 }
}

export const publicReader = (d: ReaderDoc): Reader => ({ id: d.id, name: d.name, avatar: d.avatar || undefined, provider: d.provider, verified: d.provider === 'github' && Boolean(d.githubLogin), github: d.provider === 'github' ? d.githubLogin || undefined : undefined })

/** Finds the reader for a sign-in (by provider id, then by email) or creates them. */
export async function upsertReader(payload: Payload, p: { provider: 'github' | 'email' | 'google'; providerId: string; email?: string; name: string; avatar?: string; githubLogin?: string }): Promise<ReaderDoc> {
  const email = p.email?.toLowerCase()
  const byProvider = (await payload.find({ collection: 'readers' as never, where: { and: [{ provider: { equals: p.provider } }, { providerId: { equals: p.providerId } }] }, limit: 1, depth: 0, overrideAccess: true })).docs[0] as unknown as ReaderDoc | undefined
  const existing = byProvider ?? (email ? ((await payload.find({ collection: 'readers' as never, where: { email: { equals: email } }, limit: 1, depth: 0, overrideAccess: true })).docs[0] as unknown as ReaderDoc | undefined) : undefined)
  const now = new Date().toISOString()
  if (existing) {
    return (await payload.update({
      collection: 'readers' as never,
      id: existing.id,
      // Keep a name the reader chose; fill in what was missing.
      data: { lastSeenAt: now, avatar: existing.avatar || p.avatar, email: existing.email || email, githubLogin: p.githubLogin } as never,
      overrideAccess: true,
    })) as unknown as ReaderDoc
  }
  return (await payload.create({
    collection: 'readers' as never,
    data: { name: p.name.slice(0, 60) || 'Reader', email, avatar: p.avatar, provider: p.provider, providerId: p.providerId, githubLogin: p.githubLogin, status: 'active', sessionVersion: 1, lastSeenAt: now } as never,
    overrideAccess: true,
  })) as unknown as ReaderDoc
}

/** Sign-in links: a random token emailed to the reader; only its hash is stored. */
export const newLinkToken = () => randomBytes(32).toString('base64url')
export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')

/** Only paths on this site, so a sign-in link can't send anyone elsewhere. */
export function safeNext(next: unknown): string {
  const s = typeof next === 'string' ? next : ''
  return /^\/(?!\/)[^\s\\]*$/.test(s) ? s.slice(0, 300) : '/notes'
}
