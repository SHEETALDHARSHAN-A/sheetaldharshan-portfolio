import configPromise from '@payload-config'
import type { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import { hashToken, upsertReader } from '@/utilities/readerSession'
import { finishSignIn } from '@/utilities/readerSignIn'

type Link = { id: number; email: string; name?: string | null; next?: string | null; expiresAt: string; usedAt?: string | null }

/** The link in a sign-in email: works once, within 15 minutes, then signs the reader in. */
export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin
  const token = request.nextUrl.searchParams.get('token') ?? ''
  const payload = await getPayload({ config: configPromise })
  const link = token
    ? ((await payload.find({ collection: 'reader-links' as never, where: { tokenHash: { equals: hashToken(token) } }, limit: 1, depth: 0, overrideAccess: true })).docs[0] as unknown as Link | undefined)
    : undefined
  if (!link) return finishSignIn(origin, '/notes', null, 'invalid')
  const next = link.next || '/notes'
  if (link.usedAt || new Date(link.expiresAt).getTime() < Date.now()) return finishSignIn(origin, next, null, 'expired')
  await payload.update({ collection: 'reader-links' as never, id: link.id, data: { usedAt: new Date().toISOString() } as never, overrideAccess: true })
  // Old links are no use to anyone; tidy them while we're here.
  await payload.delete({ collection: 'reader-links' as never, where: { expiresAt: { less_than: new Date(Date.now() - 86400_000).toISOString() } }, overrideAccess: true }).catch(() => undefined)
  const doc = await upsertReader(payload, { provider: 'email', providerId: link.email, email: link.email, name: link.name || link.email.split('@')[0] })
  return finishSignIn(origin, next, doc)
}
