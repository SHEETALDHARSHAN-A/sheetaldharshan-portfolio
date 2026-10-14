import { siteMeta } from '@/data/site'
export function GET() { return new Response(`User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${siteMeta.url}/sitemap.xml`, { headers: { 'Content-Type': 'text/plain' } }) }
