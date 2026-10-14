import { getPosts, getProjects, getPublishedPageSlugs, getSite } from '@/data/content'

export const dynamic = 'force-dynamic'

export async function GET() {
  const [site, projects, posts, pages] = await Promise.all([getSite(), getProjects(), getPosts({ limit: 1000 }), getPublishedPageSlugs()])
  const base = site.canonicalUrl.replace(/\/$/, '')
  const entries: { loc: string; priority: string }[] = [
    { loc: '', priority: '1.0' },
    { loc: '/projects', priority: '0.9' },
    { loc: '/blog', priority: '0.8' },
    { loc: '/about', priority: '0.8' },
    { loc: '/research', priority: '0.6' },
    { loc: '/contact', priority: '0.5' },
    ...projects.map((project) => ({ loc: `/projects/${project.slug}`, priority: '0.8' })),
    ...posts.map((post) => ({ loc: `/blog/${post.slug}`, priority: '0.7' })),
    ...pages.map((slug) => ({ loc: `/${slug}`, priority: '0.5' })),
  ]
  const urls = entries.map((entry) => `<url><loc>${base}${entry.loc}</loc><priority>${entry.priority}</priority></url>`).join('')
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=300' },
  })
}
