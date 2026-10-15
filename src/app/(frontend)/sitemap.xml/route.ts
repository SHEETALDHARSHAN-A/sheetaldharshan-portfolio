import { getPosts, getProjects, getPublishedPageSlugs, getSite } from '@/data/content'

export const dynamic = 'force-dynamic'

export async function GET() {
  const [site, projects, posts, pages] = await Promise.all([getSite(), getProjects(), getPosts({ limit: 1000 }), getPublishedPageSlugs()])
  const base = site.canonicalUrl.replace(/\/$/, '')
  // Section pages change whenever their newest item does; detail pages carry their own date.
  const day = (date?: string) => (date ? new Date(date).toISOString().slice(0, 10) : undefined)
  const newest = (dates: (string | undefined)[]) => dates.filter(Boolean).sort().at(-1)
  const latestProject = newest(projects.map((p) => p.updatedAt))
  const latestPost = newest(posts.map((p) => p.updatedAt))
  const latest = newest([latestProject, latestPost])
  const entries: { loc: string; priority: string; lastmod?: string }[] = [
    { loc: '', priority: '1.0', lastmod: day(latest) },
    { loc: '/about', priority: '0.9', lastmod: day(latest) },
    { loc: '/projects', priority: '0.9', lastmod: day(latestProject) },
    { loc: '/blog', priority: '0.7', lastmod: day(latestPost) },
    { loc: '/research', priority: '0.6' },
    { loc: '/contact', priority: '0.6' },
    ...projects.map((project) => ({ loc: `/projects/${project.slug}`, priority: '0.8', lastmod: day(project.updatedAt) })),
    ...posts.map((post) => ({ loc: `/blog/${post.slug}`, priority: '0.7', lastmod: day(post.updatedAt) })),
    ...pages.map((slug) => ({ loc: `/${slug}`, priority: '0.5' })),
  ]
  const urls = entries
    .map((entry) => `<url><loc>${base}${entry.loc}</loc>${entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ''}<priority>${entry.priority}</priority></url>`)
    .join('')
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=300' },
  })
}
