/** Slugs that CMS pages may not claim because the application owns these routes. */
export const RESERVED_SLUGS = [
  'admin',
  'api',
  'projects',
  'blog',
  'posts',
  'about',
  'contact',
  'research',
  'search',
  'next',
  'media',
  '_next',
  'sitemap.xml',
  'robots.txt',
  'rss.xml',
  'pages-sitemap.xml',
  'posts-sitemap.xml',
  'projects-sitemap.xml',
  'favicon.ico',
  'not-found',
  'home',
]

export const isReservedSlug = (slug: string | null | undefined) => !!slug && RESERVED_SLUGS.includes(slug.toLowerCase())
