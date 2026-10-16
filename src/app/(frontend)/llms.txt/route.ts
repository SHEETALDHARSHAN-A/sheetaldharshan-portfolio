import { getPosts, getProjects, getPublications, getSite } from '@/data/content'
import { brandName } from '@/data/seo'

export const revalidate = 300

/**
 * /llms.txt: a plain-Markdown summary of who this is and what is on the site, for AI search and
 * assistants (ChatGPT, Perplexity, Claude) that read it to answer questions about the owner.
 */
export async function GET() {
  const [site, projects, posts, publications] = await Promise.all([getSite(), getProjects(), getPosts({ limit: 50 }), getPublications()])
  const base = site.canonicalUrl.replace(/\/$/, '')
  const lines = [
    `# ${brandName(site)}`,
    '',
    `> ${site.description}`,
    '',
    [site.currentRole, site.location].filter(Boolean).join(' · '),
    '',
    '## Pages',
    `- [About](${base}/about): background, experience, education and skills`,
    `- [Projects](${base}/projects): things I have built and contributed to`,
    `- [Writing](${base}/blog): technical posts`,
    `- [Research](${base}/research): publications`,
    `- [Contact](${base}/contact): email and profiles`,
    '',
    '## Projects',
    ...projects.map((p) => `- [${p.title}](${base}/projects/${p.slug}): ${p.summary}`),
    ...(posts.length ? ['', '## Writing', ...posts.map((p) => `- [${p.title}](${base}/blog/${p.slug})${p.excerpt ? `: ${p.excerpt}` : ''}`)] : []),
    ...(publications.length
      ? ['', '## Research', ...publications.map((p) => `- ${p.title} (${[p.publisher, p.venue, p.year].filter(Boolean).join(', ')})${p.doi ? `: https://doi.org/${p.doi}` : ''}`)]
      : []),
    '',
    '## Profiles',
    ...site.socialLinks.map((l) => `- [${l.label}](${l.href})`),
    ...(site.email ? [`- Email: ${site.email}`] : []),
    '',
  ]
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Cache-Control': 'public, max-age=300' } })
}
