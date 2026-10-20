import configPromise from '@payload-config'
import type { NextRequest } from 'next/server'
import { getPayload, type Payload } from 'payload'
import { hashToken, upsertReader } from '@/utilities/readerSession'
import { finishSignIn } from '@/utilities/readerSignIn'

type Link = { id: number; email: string; name?: string | null; next?: string | null; expiresAt: string; usedAt?: string | null }

async function findLink(payload: Payload, token: string): Promise<Link | undefined> {
  if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) return undefined
  return (await payload.find({ collection: 'reader-links' as never, where: { tokenHash: { equals: hashToken(token) } }, limit: 1, depth: 0, overrideAccess: true })).docs[0] as unknown as Link | undefined
}
const usable = (l?: Link): l is Link => Boolean(l && !l.usedAt && new Date(l.expiresAt).getTime() > Date.now())
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

function page(title: string, body: string, status = 200) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(title)}</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#000;color:#f2f2f2;font:16px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;padding:16px}main{max-width:420px;width:100%;padding:28px;border:1px solid rgba(255,255,255,.18);border-radius:16px;text-align:center}h1{font-size:22px;margin:0 0 8px}p{color:#a8a8ad;margin:0 0 20px}button,a.b{display:inline-block;border:0;border-radius:999px;background:#f2f2f2;color:#000;font:600 15px/1 inherit;padding:13px 22px;cursor:pointer;text-decoration:none}</style></head>
<body><main>${body}</main></body></html>`
  return new Response(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } })
}

/**
 * The link in a sign-in email. Opening it only shows a "Sign in" button: mail scanners that open
 * links on their own would otherwise use up the one-time link before the reader does. Pressing
 * the button (a POST from this page) signs the reader in.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') ?? ''
  const link = await findLink(await getPayload({ config: configPromise }), token)
  if (!usable(link)) return page('Link expired', `<h1>This link has expired</h1><p>Sign-in links work once, for 15 minutes. Ask for a new one on the page you were reading.</p><a class="b" href="/notes">Back to Field Notes</a>`, 410)
  return page('Sign in', `<h1>Sign in to Field Notes</h1><p>as <strong>${esc(link.email)}</strong></p><form method="post"><input type="hidden" name="token" value="${esc(token)}"><button type="submit">Sign in</button></form>`)
}

export async function POST(request: NextRequest) {
  const origin = new URL(request.url).origin
  // Only the button on our own page may complete a sign-in.
  const from = request.headers.get('origin')
  if (from && from !== origin) return page('Not allowed', '<h1>Not allowed</h1>', 403)
  const token = String((await request.formData().catch(() => null))?.get('token') ?? '')
  const payload = await getPayload({ config: configPromise })
  const link = await findLink(payload, token)
  if (!usable(link)) return finishSignIn(origin, (link as Link | undefined)?.next || '/notes', null, link ? 'expired' : 'invalid', 303)
  await payload.update({ collection: 'reader-links' as never, id: link.id, data: { usedAt: new Date().toISOString() } as never, overrideAccess: true })
  // Old links are no use to anyone; tidy them while we're here.
  await payload.delete({ collection: 'reader-links' as never, where: { expiresAt: { less_than: new Date(Date.now() - 86400_000).toISOString() } }, overrideAccess: true }).catch(() => undefined)
  const doc = await upsertReader(payload, { provider: 'email', providerId: link.email, email: link.email, name: link.name || link.email.split('@')[0] })
  return finishSignIn(origin, link.next || '/notes', doc, undefined, 303)
}
