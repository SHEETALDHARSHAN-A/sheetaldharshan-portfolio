import { getPosts, getSite } from '@/data/content'

export const dynamic = 'force-dynamic'

const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export async function GET() {
  const [site, posts] = await Promise.all([getSite(), getPosts({ limit: 50 })])
  const base = site.canonicalUrl.replace(/\/$/, '')
  const items = posts
    .map(
      (post) =>
        `<item><title>${escape(post.title)}</title><link>${base}/blog/${post.slug}</link><guid isPermaLink="true">${base}/blog/${post.slug}</guid>${post.publishedAt ? `<pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>` : ''}${post.excerpt ? `<description>${escape(post.excerpt)}</description>` : ''}</item>`,
    )
    .join('')
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${escape(site.displayName)} · Notes</title><link>${base}/blog</link><atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml"/><description>${escape(site.description)}</description><language>en</language>${items}</channel></rss>`
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=300' } })
}
