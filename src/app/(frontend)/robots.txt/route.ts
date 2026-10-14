import { getSite } from '@/data/content'

export const dynamic = 'force-dynamic'

export async function GET() {
  const site = await getSite()
  const base = site.canonicalUrl.replace(/\/$/, '')
  const body = ['User-agent: *', 'Allow: /', 'Disallow: /admin', 'Disallow: /api/', 'Disallow: /next/', '', `Sitemap: ${base}/sitemap.xml`].join('\n')
  return new Response(body, { headers: { 'Content-Type': 'text/plain' } })
}
