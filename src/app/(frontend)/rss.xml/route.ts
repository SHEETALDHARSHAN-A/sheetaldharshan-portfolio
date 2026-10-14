import { posts, siteMeta } from '@/data/site'

export function GET() { const items = posts.filter((post) => !post.draft).map((post) => `<item><title>${post.title}</title><link>${siteMeta.url}/blog/${post.slug}</link><description>${post.excerpt}</description></item>`).join(''); return new Response(`<?xml version="1.0" encoding="UTF-8" ?><rss version="2.0"><channel><title>${siteMeta.title}</title><link>${siteMeta.url}</link>${items}</channel></rss>`, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } }) }
