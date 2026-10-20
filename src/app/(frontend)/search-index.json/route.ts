import { aboutSectionId, type SearchDoc } from '@/data/types'
import {
  formatDate,
  getAbout,
  getCertifications,
  getEducation,
  getExperience,
  getPost,
  getPosts,
  getProject,
  getProjects,
  getPublications,
  getSite,
  lexicalToText,
} from '@/data/content'

export const revalidate = 300

const clip = (text: string | undefined, max = 4000) => (text ?? '').replace(/\s+/g, ' ').trim().slice(0, max)
const join = (...parts: (string | number | undefined | null)[]) => parts.filter((part) => part !== undefined && part !== null && part !== '').join(' ')

/** Everything the pet's site search can find, built from the CMS. Static, refreshed every five minutes. */
export async function GET() {
  const [site, projects, posts, publications, experience, education, certifications, about] = await Promise.all([
    getSite(),
    getProjects(),
    getPosts({ limit: 200 }),
    getPublications(),
    getExperience(),
    getEducation(),
    getCertifications(),
    getAbout(),
  ])
  const [projectDetails, postDetails] = await Promise.all([
    Promise.all(projects.map((project) => getProject(project.slug).catch(() => null))),
    Promise.all(posts.map((post) => getPost(post.slug).catch(() => null))),
  ])
  const sectionHref = (kind: string) => {
    const section = about.sections.find((s) => s.kind === kind)
    return section ? `/about#${aboutSectionId(section)}` : '/about'
  }

  const docs: SearchDoc[] = [
    { id: 'page:home', type: 'page', title: 'Home', subtitle: site.tagline, href: '/', keywords: 'home start hello intro welcome conversation' },
    { id: 'page:projects', type: 'page', title: 'Projects', subtitle: 'Things I have built and contributed to', href: '/projects', keywords: 'projects work portfolio case studies builds apps code' },
    { id: 'page:kb', type: 'page', title: 'Field Notes', subtitle: 'Posts by channel', href: '/notes', keywords: 'Field Notes kb writing blog posts articles notes essays channels' },
    { id: 'page:about', type: 'page', title: 'About', subtitle: join(site.currentRole, site.location), href: '/about', keywords: 'about me bio background resume cv who', body: clip(about.intro.join(' ')) },
    { id: 'page:research', type: 'page', title: 'Research', subtitle: 'Publications', href: '/research', keywords: 'research publications papers ieee conference journal' },
    { id: 'page:contact', type: 'page', title: 'Contact', subtitle: site.email, href: '/contact', keywords: 'contact email mail hire reach message touch talk' },
  ]

  if (site.email) docs.push({ id: 'link:email', type: 'link', title: `Email ${site.email}`, subtitle: 'Opens your mail app', href: `mailto:${site.email}`, external: true, keywords: 'email mail write message contact' })
  if (site.resumeUrl) docs.push({ id: 'link:resume', type: 'link', title: 'Résumé (PDF)', subtitle: 'Download', href: site.resumeUrl, external: true, keywords: 'resume cv pdf download' })
  for (const link of site.socialLinks) {
    docs.push({ id: `link:${link.href}`, type: 'link', title: link.label, subtitle: link.href.replace(/^https?:\/\/(www\.)?/, ''), href: link.href, external: true, keywords: 'profile social code repositories' })
  }
  for (const item of site.nav) {
    if (!docs.some((doc) => doc.href === item.href)) docs.push({ id: `page:${item.href}`, type: 'page', title: item.label, href: item.href })
  }

  projects.forEach((project, i) => {
    const detail = projectDetails[i]
    docs.push({
      id: `project:${project.slug}`,
      type: 'project',
      title: project.title,
      subtitle: join(project.kindLabel, project.category ? `· ${project.category}` : undefined, project.year ? `· ${project.year}` : undefined),
      href: `/projects/${project.slug}`,
      keywords: join(project.category, project.kindLabel, project.role, project.client, project.year),
      tags: [...project.technologies, ...project.tags].join(' '),
      body: clip(join(project.summary, detail?.description)),
      featured: project.featured,
    })
  })

  posts.forEach((post, i) => {
    const detail = postDetails[i]
    docs.push({
      id: `post:${post.slug}`,
      type: 'post',
      title: post.title,
      subtitle: join(formatDate(post.publishedAt), `· ${post.readingMinutes} min read`),
      href: `/notes/${post.slug}`,
      keywords: post.categories.join(' '),
      tags: (detail?.tags ?? []).join(' '),
      body: clip(join(post.excerpt, detail ? lexicalToText(detail.content) : undefined)),
    })
  })

  for (const pub of publications) {
    docs.push({
      id: `publication:${pub.id}`,
      type: 'publication',
      title: pub.title,
      subtitle: join(pub.venue ?? pub.publisher, pub.year ? `· ${pub.year}` : undefined),
      href: '/research',
      keywords: join(pub.authors, pub.publisher, pub.kind, pub.doi),
      tags: pub.tags.join(' '),
      body: clip(join(pub.abstract, pub.personalContribution)),
    })
  }

  for (const entry of experience) {
    docs.push({
      id: `experience:${entry.id}`,
      type: 'experience',
      title: `${entry.role}, ${entry.company}`,
      subtitle: join(entry.location, entry.current ? '· current' : undefined),
      href: sectionHref('experience'),
      keywords: join('experience work job role career', entry.company, entry.role),
      tags: entry.technologies.join(' '),
      body: clip(join(entry.summary, ...entry.highlights)),
    })
  }

  for (const entry of education) {
    docs.push({
      id: `education:${entry.id}`,
      type: 'education',
      title: join(entry.degree, entry.field ? `in ${entry.field}` : undefined),
      subtitle: entry.institution,
      href: sectionHref('education'),
      keywords: join('education degree college university study', entry.institution, entry.location),
      body: clip(entry.notes),
    })
  }

  for (const cert of certifications) {
    docs.push({
      id: `certification:${cert.id}`,
      type: 'certification',
      title: cert.title,
      subtitle: join(cert.issuer, cert.year ? `· ${cert.year}` : undefined),
      href: cert.url ?? sectionHref('certifications'),
      external: Boolean(cert.url),
      keywords: join('certification certificate course', cert.issuer),
    })
  }

  for (const section of about.sections) {
    if (section.kind === 'technologies') {
      for (const group of section.groups) {
        docs.push({
          id: `skills:${group.label}`,
          type: 'skill',
          title: group.label,
          subtitle: group.items.slice(0, 6).join(', '),
          href: `/about#${aboutSectionId(section)}`,
          keywords: 'skills stack technologies tools languages',
          tags: group.items.join(' '),
        })
      }
    } else if (section.kind === 'text') {
      docs.push({ id: `about:${aboutSectionId(section)}`, type: 'page', title: section.title, subtitle: 'About', href: `/about#${aboutSectionId(section)}`, body: clip(lexicalToText(section.body)) })
    }
  }

  return Response.json({ version: 1, docs }, { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400' } })
}
