import configPromise from '@payload-config'
import type { NextRequest } from 'next/server'
import { getPayload, type Payload } from 'payload'
import { hashToken, upsertReader } from '@/utilities/readerSession'
import { finishSignIn } from '@/utilities/readerSignIn'
import { LINK_COOKIE } from '@/endpoints/kb'

type Link = { id: number; email: string; name?: string | null; next?: string | null; expiresAt: string; usedAt?: string | null; pollHash?: string | null }

async function findLink(payload: Payload, token: string): Promise<Link | undefined> {
  if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) return undefined
  return (await payload.find({ collection: 'reader-links' as never, where: { tokenHash: { equals: hashToken(token) } }, limit: 1, depth: 0, overrideAccess: true })).docs[0] as unknown as Link | undefined
}
const usable = (l?: Link): l is Link => Boolean(l && !l.usedAt && new Date(l.expiresAt).getTime() > Date.now())
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

/** Small animated pictures for each state (inline SVG, no scripts). */
const ICONS = {
  mail: `<svg viewBox="0 0 64 64" width="64" height="64" class="i mail" aria-hidden="true"><rect x="8" y="16" width="48" height="34" rx="6"/><path d="m10 20 22 17 22-17"/></svg>`,
  clock: `<svg viewBox="0 0 64 64" width="64" height="64" class="i clock" aria-hidden="true"><circle cx="32" cy="34" r="22"/><path class="hand" d="M32 34V20"/><path d="M32 34l9 6"/><path d="M26 6h12"/></svg>`,
  shield: `<svg viewBox="0 0 64 64" width="64" height="64" class="i shield" aria-hidden="true"><path d="M32 6 10 14v16c0 14 9.5 24 22 28 12.5-4 22-14 22-28V14z"/><path class="tick" d="m22 33 7 7 13-14"/></svg>`,
}

function page(title: string, body: string, icon: keyof typeof ICONS, status = 200) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(title)}</title>
<style>
:root{color-scheme:dark}
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#000;color:#f2f2f2;font:16px/1.55 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;padding:20px;box-sizing:border-box}
main{box-sizing:border-box;max-width:440px;width:100%;padding:30px 22px;border:1px solid rgba(255,255,255,.14);border-radius:20px;background:#0d0d0e;text-align:center;animation:in .4s cubic-bezier(.2,.8,.2,1) both}
h1{font-size:22px;line-height:1.3;margin:18px 0 8px}
p{color:#a8a8ad;margin:0 0 14px}
strong{color:#f2f2f2}
.steps{text-align:left;margin:4px 0 20px;padding:14px 16px 14px 36px;border-radius:12px;background:#161618;color:#c8c8c8;font-size:14.5px}
.steps li{margin:4px 0}
.actions{display:grid;gap:10px;margin-top:6px}
button,a.b{display:block;width:100%;box-sizing:border-box;border:0;border-radius:999px;background:#f2f2f2;color:#000;font:600 15px/1 inherit;padding:14px 22px;cursor:pointer;text-decoration:none}
a.g{background:transparent;color:#f2f2f2;border:1px solid rgba(255,255,255,.2)}
.i{fill:none;stroke:#3d8bff;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
.mail{animation:float 2.4s ease-in-out infinite}
.clock .hand{transform-origin:32px 34px;animation:spin 2.6s linear infinite}
.shield .tick{stroke-dasharray:40;stroke-dashoffset:40;animation:draw .9s .3s ease forwards}
@keyframes in{from{opacity:0;transform:translateY(8px)}}
@keyframes float{50%{transform:translateY(-5px)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes draw{to{stroke-dashoffset:0}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}.shield .tick{stroke-dashoffset:0}}
</style></head>
<body><main>${ICONS[icon]}${body}</main></body></html>`
  // same-origin: the button's POST still says which site it came from; the link never leaves this site.
  return new Response(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Referrer-Policy': 'same-origin' } })
}

const expiredPage = () =>
  page(
    'Link expired',
    `<h1>This sign-in link has expired</h1><p>For your safety, each link works <strong>once</strong>, for <strong>15 minutes</strong>. This one was already used, or its time ran out.</p>
<ol class="steps"><li>Go back to the post you were reading.</li><li>Choose <strong>Sign in → Email me a sign-in link</strong>.</li><li>Open the newest email and tap <strong>Sign in</strong>.</li></ol>
<div class="actions"><a class="b" href="/notes">Back to ./stdout</a></div>`,
    'clock',
    410,
  )

/**
 * The link in a sign-in email. Opening it only shows a "Sign in" button: mail scanners that open
 * links on their own would otherwise use up the one-time link before the reader does. Pressing
 * the button (a POST from this page) signs the reader in.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') ?? ''
  const link = await findLink(await getPayload({ config: configPromise }), token)
  if (!usable(link)) return expiredPage()
  return page(
    'Sign in',
    `<h1>Sign in to ./stdout</h1><p>Signing in as <strong>${esc(link.email)}</strong>. Tap the button to approve. If you asked for this link on another device (like your laptop), <strong>that device</strong> signs in by itself.</p>
<form method="post" class="actions"><input type="hidden" name="token" value="${esc(token)}"><button type="submit">Sign in</button><a class="b g" href="/notes">Not you? Cancel</a></form>`,
    'mail',
  )
}

export async function POST(request: NextRequest) {
  const origin = new URL(request.url).origin
  // The one-time token is what proves this is the reader. Still, refuse a press that a browser
  // marks as coming from another website.
  const from = request.headers.get('origin')
  const fetchSite = request.headers.get('sec-fetch-site')
  if (fetchSite === 'cross-site' || (from && from !== 'null' && from !== origin)) {
    return page(
      'Open this link in your browser',
      `<h1>Let's finish this in your browser</h1><p>This sign-in was started from another website or app, so we stopped it to keep your account safe.</p>
<ol class="steps"><li>Go back to your email.</li><li>Open the sign-in link in <strong>Safari, Chrome or your usual browser</strong> (on a phone: hold the link, then choose “Open in browser”).</li><li>Tap <strong>Sign in</strong> there.</li></ol>
<div class="actions"><a class="b" href="/notes">Back to ./stdout</a></div>`,
      'shield',
      403,
    )
  }
  const token = String((await request.formData().catch(() => null))?.get('token') ?? '')
  const payload = await getPayload({ config: configPromise })
  const link = await findLink(payload, token)
  if (!usable(link)) return finishSignIn(origin, (link as Link | undefined)?.next || '/notes', null, link ? 'expired' : 'invalid', 303)
  const now = new Date().toISOString()
  // Opened in the same browser that asked for it: sign in right here.
  const waiting = request.cookies.get(LINK_COOKIE)?.value
  const sameDevice = !link.pollHash || (waiting ? hashToken(waiting) === link.pollHash : false)
  // Old links are no use to anyone; tidy them while we're here.
  await payload.delete({ collection: 'reader-links' as never, where: { expiresAt: { less_than: new Date(Date.now() - 86400_000).toISOString() } }, overrideAccess: true }).catch(() => undefined)
  const doc = await upsertReader(payload, { provider: 'email', providerId: link.email, email: link.email, name: link.name || link.email.split('@')[0] })
  if (sameDevice) {
    await payload.update({ collection: 'reader-links' as never, id: link.id, data: { usedAt: now, confirmedAt: now, claimedAt: now, reader: doc.id } as never, overrideAccess: true })
    const res = finishSignIn(origin, link.next || '/notes', doc, undefined, 303)
    res.cookies.set(LINK_COOKIE, '', { path: '/', maxAge: 0 })
    return res
  }
  // Opened on another device (say, a phone): this only approves. The device that asked for the
  // link notices within a few seconds and signs itself in; nothing is signed in here.
  await payload.update({ collection: 'reader-links' as never, id: link.id, data: { usedAt: now, confirmedAt: now, reader: doc.id } as never, overrideAccess: true })
  if (doc.status === 'blocked') return finishSignIn(origin, link.next || '/notes', doc, undefined, 303)
  return page(
    'Approved',
    `<h1>Approved. You're signed in on your other device</h1><p>Go back to the device where you asked for the link (your laptop or computer). It signs in by itself within a few seconds, and the page there updates on its own.</p>
<p>Nothing was signed in on this device. You can close this tab.</p>`,
    'shield',
  )
}
