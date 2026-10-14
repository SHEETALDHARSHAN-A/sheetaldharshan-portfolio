import { cache } from 'react'
import { draftMode } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload, type Payload, type Where } from 'payload'

import type { About as AboutDoc, Category, Post as PostDoc, Project as ProjectDoc } from '@/payload-types'
import { toMediaRef } from '@/data/media'
import {
  kindLabels,
  type AboutContent,
  type AboutSection,
  type CertificationEntry,
  type Conversation,
  type EducationEntry,
  type ExperienceEntry,
  type NavItem,
  type Post,
  type PostSummary,
  type Project,
  type ProjectKind,
  type ProjectSummary,
  type Publication,
  type Site,
} from '@/data/types'
import { defaultTheme, resolveTheme, type ThemeSettings } from '@/styles/theme'

const getClient = cache(async (): Promise<Payload> => getPayload({ config: configPromise }))

async function isDraft(): Promise<boolean> {
  try {
    return (await draftMode()).isEnabled
  } catch {
    return false
  }
}

const defaultNav: NavItem[] = [
  { label: 'Projects', href: '/projects' },
  { label: 'About', href: '/about' },
  { label: 'Research', href: '/research' },
  { label: 'Contact', href: '/contact' },
]

const names = (rows: { name?: string | null }[] | null | undefined) => (rows ?? []).map((row) => row.name ?? '').filter(Boolean)

/* ------------------------------------------------------------------ globals */

export const getSite = cache(async (): Promise<Site> => {
  const payload = await getClient()
  const [settings, navigation, pages] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings', depth: 1 }).catch(() => null),
    payload.findGlobal({ slug: 'navigation', depth: 0 }).catch(() => null),
    payload
      .find({ collection: 'pages', depth: 0, limit: 20, where: { and: [{ _status: { equals: 'published' } }, { showInNavigation: { equals: true } }] } })
      .catch(() => null),
  ])
  const nav = (navigation?.items ?? []).filter((item) => item.visible !== false && item.label && item.href).map((item) => ({ label: item.label, href: item.href, newTab: item.newTab ?? false }))
  const pageLinks = (pages?.docs ?? []).map((page) => ({ label: page.title, href: `/${page.slug}` }))
  return {
    displayName: settings?.displayName || 'Sheetaldharshan',
    fullName: settings?.fullName || 'Sheetaldharshan A',
    tagline: settings?.tagline || 'I build developer tools and AI agents that work over real databases.',
    description: settings?.description || 'Software engineer at Exasol. Developer tools and AI agents that work over real databases.',
    canonicalUrl: settings?.canonicalUrl || 'https://sheetaldharshan.me',
    currentRole: settings?.currentRole ?? undefined,
    location: settings?.location ?? undefined,
    socialLinks: (settings?.socialLinks ?? []).map((link) => ({ label: link.label, href: link.href })),
    email: settings?.email ?? undefined,
    contactFormEnabled: settings?.contactFormEnabled ?? false,
    resume: toMediaRef(settings?.resume),
    ogImage: toMediaRef(settings?.ogImage),
    footerNote: settings?.footerNote ?? undefined,
    nav: [...(nav.length ? nav : defaultNav), ...pageLinks],
    footerLinks: (navigation?.footerLinks ?? []).map((link) => ({ label: link.label, href: link.href })),
  }
})

export const getAppearance = cache(async (): Promise<ThemeSettings> => {
  try {
    const payload = await getClient()
    const appearance = await payload.findGlobal({ slug: 'appearance', depth: 0 })
    return resolveTheme(appearance as unknown as Record<string, unknown>)
  } catch {
    return defaultTheme
  }
})

export const getHomepage = cache(async (): Promise<Conversation> => {
  const payload = await getClient()
  const draft = await isDraft()
  const homepage = await payload.findGlobal({ slug: 'homepage', depth: 0, draft, overrideAccess: draft }).catch(() => null)
  const messages = (homepage?.messages ?? [])
    .filter((message) => message.enabled !== false && message.content?.trim())
    .map((message, index) => ({
      id: message.id ?? `m${index}`,
      content: message.content.trim(),
      style: (message.style ?? 'default') as Conversation['messages'][number]['style'],
      revealDelay: message.revealDelay ? Math.max(0, Math.min(10000, message.revealDelay)) : 0,
      choices: (message.choices ?? []).filter((choice) => choice.label && choice.href).map((choice) => ({ label: choice.label, href: choice.href, newTab: choice.newTab ?? false })),
    }))
  return {
    // Until the CMS is seeded the page shows one neutral line rather than invented copy.
    messages: messages.length ? messages : [{ id: 'setup', content: 'Hey there. This site is being set up in [the admin](/admin).', style: 'default', revealDelay: 600, choices: [] }],
    animationPreset: (homepage?.animationPreset ?? 'calm') as Conversation['animationPreset'],
    typingIndicator: (homepage?.typingIndicator ?? 'dots') as Conversation['typingIndicator'],
    startDelay: Math.max(0, Math.min(5000, homepage?.startDelay ?? 400)),
    meta: { title: homepage?.meta?.title ?? undefined, description: homepage?.meta?.description ?? undefined },
  }
})

/* ------------------------------------------------------------------ projects */

function toProjectSummary(doc: ProjectDoc): ProjectSummary {
  const kind = (doc.kind ?? 'personal') as ProjectKind
  return {
    id: String(doc.id),
    slug: doc.slug,
    title: doc.title,
    summary: doc.summary,
    kind,
    kindLabel: kindLabels[kind],
    category: doc.category ?? undefined,
    year: doc.year ?? undefined,
    role: doc.role ?? undefined,
    client: doc.client ?? undefined,
    technologies: names(doc.technologies),
    tags: names(doc.tags),
    featured: doc.featured ?? false,
    accent: (doc.accent ?? 'blue') as ProjectSummary['accent'],
    thumbnail: toMediaRef(doc.thumbnail),
    heroImage: toMediaRef(doc.heroImage),
    heroVideo: toMediaRef(doc.heroVideo),
    githubUrl: doc.githubUrl ?? undefined,
    liveDemoUrl: doc.liveDemoUrl ?? undefined,
    documentationUrl: doc.documentationUrl ?? undefined,
    releasesUrl: doc.releasesUrl ?? undefined,
  }
}

function toProject(doc: ProjectDoc): Project {
  return {
    ...toProjectSummary(doc),
    description: doc.description ?? undefined,
    screenshots: (doc.screenshots ?? []).flatMap((shot) => {
      const media = toMediaRef(shot.media)
      return media ? [{ media, caption: shot.caption ?? undefined }] : []
    }),
    demoVideoUrl: doc.demoVideoUrl ?? undefined,
    layout: (doc.layout ?? []) as unknown[],
    layoutPreset: (doc.layoutPreset ?? 'case-study') as Project['layoutPreset'],
    meta: { title: doc.meta?.title ?? undefined, description: doc.meta?.description ?? undefined, image: toMediaRef(doc.meta?.image) },
  }
}

export const getProjects = cache(async (options: { featuredOnly?: boolean } = {}): Promise<ProjectSummary[]> => {
  const payload = await getClient()
  const result = await payload
    .find({
      collection: 'projects',
      depth: 1,
      limit: 100,
      sort: 'displayOrder',
      where: {
        and: [{ _status: { equals: 'published' } }, { archived: { not_equals: true } }, ...(options.featuredOnly ? [{ featured: { equals: true } }] : [])],
      },
    })
    .catch(() => null)
  return (result?.docs ?? []).map(toProjectSummary)
})

export const getProject = cache(async (slug: string): Promise<Project | null> => {
  const payload = await getClient()
  const draft = await isDraft()
  const result = await payload
    .find({ collection: 'projects', depth: 2, limit: 1, draft, overrideAccess: draft, pagination: false, where: { slug: { equals: slug } } })
    .catch(() => null)
  const doc = result?.docs?.[0]
  if (!doc) return null
  if (!draft && (doc._status !== 'published' || doc.archived)) return null
  return toProject(doc)
})

/* ------------------------------------------------------------------ posts */

type LexicalNode = { type?: string; text?: string; children?: LexicalNode[] }

export function lexicalToText(content: unknown): string {
  const root = (content as { root?: LexicalNode } | null)?.root
  const out: string[] = []
  const walk = (node?: LexicalNode) => {
    if (!node) return
    if (typeof node.text === 'string') out.push(node.text)
    node.children?.forEach(walk)
  }
  walk(root)
  return out.join(' ')
}

function readingMinutes(content: unknown): number {
  const words = lexicalToText(content).split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 220))
}

function categoryTitles(categories: PostDoc['categories']): string[] {
  return (categories ?? []).map((category) => (typeof category === 'object' ? (category as Category).title : '')).filter(Boolean)
}

function toPostSummary(doc: PostDoc): PostSummary {
  return {
    id: String(doc.id),
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.meta?.description ?? undefined,
    publishedAt: doc.publishedAt ?? undefined,
    categories: categoryTitles(doc.categories),
    readingMinutes: readingMinutes(doc.content),
    cover: toMediaRef(doc.heroImage) ?? toMediaRef(doc.meta?.image),
  }
}

export const getPosts = cache(async (options: { query?: string; category?: string; limit?: number } = {}): Promise<PostSummary[]> => {
  const payload = await getClient()
  const conditions: Where[] = [{ _status: { equals: 'published' } }]
  if (options.query) conditions.push({ or: [{ title: { like: options.query } }, { 'meta.description': { like: options.query } }] })
  if (options.category) conditions.push({ 'categories.slug': { equals: options.category } })
  const result = await payload
    .find({ collection: 'posts', depth: 1, limit: options.limit ?? 50, sort: '-publishedAt', where: { and: conditions } })
    .catch(() => null)
  return (result?.docs ?? []).map(toPostSummary)
})

export const getPost = cache(async (slug: string): Promise<Post | null> => {
  const payload = await getClient()
  const draft = await isDraft()
  const result = await payload
    .find({ collection: 'posts', depth: 2, limit: 1, draft, overrideAccess: draft, pagination: false, where: { slug: { equals: slug } } })
    .catch(() => null)
  const doc = result?.docs?.[0]
  if (!doc) return null
  if (!draft && doc._status !== 'published') return null
  return {
    ...toPostSummary(doc),
    content: doc.content,
    related: (doc.relatedPosts ?? []).filter((post): post is PostDoc => typeof post === 'object' && post._status === 'published').map(toPostSummary),
    tags: [],
    meta: { title: doc.meta?.title ?? undefined, description: doc.meta?.description ?? undefined, image: toMediaRef(doc.meta?.image) },
  }
})

export const getCategories = cache(async (): Promise<{ title: string; slug: string }[]> => {
  const payload = await getClient()
  const result = await payload.find({ collection: 'categories', depth: 0, limit: 50, sort: 'title' }).catch(() => null)
  return (result?.docs ?? []).map((category) => ({ title: category.title, slug: category.slug ?? '' })).filter((category) => category.slug)
})

/* ------------------------------------------------------------------ profile collections */

export const getExperience = cache(async (): Promise<ExperienceEntry[]> => {
  const payload = await getClient()
  const result = await payload.find({ collection: 'experience', depth: 0, limit: 50, sort: 'order', where: { _status: { equals: 'published' } } }).catch(() => null)
  return (result?.docs ?? []).map((doc) => ({
    id: String(doc.id),
    role: doc.role,
    company: doc.company,
    companyUrl: doc.companyUrl ?? undefined,
    location: doc.location ?? undefined,
    startDate: doc.startDate,
    endDate: doc.endDate ?? undefined,
    current: doc.current ?? false,
    summary: doc.summary ?? undefined,
    highlights: (doc.highlights ?? []).map((row) => row.text).filter(Boolean),
    technologies: names(doc.technologies),
  }))
})

export const getEducation = cache(async (): Promise<EducationEntry[]> => {
  const payload = await getClient()
  const result = await payload.find({ collection: 'education', depth: 0, limit: 50, sort: 'order', where: { _status: { equals: 'published' } } }).catch(() => null)
  return (result?.docs ?? []).map((doc) => ({
    id: String(doc.id),
    institution: doc.institution,
    degree: doc.degree,
    field: doc.field ?? undefined,
    startDate: doc.startDate ?? undefined,
    endDate: doc.endDate ?? undefined,
    location: doc.location ?? undefined,
    notes: doc.notes ?? undefined,
  }))
})

export const getCertifications = cache(async (): Promise<CertificationEntry[]> => {
  const payload = await getClient()
  const result = await payload.find({ collection: 'certifications', depth: 0, limit: 50, sort: 'order', where: { _status: { equals: 'published' } } }).catch(() => null)
  return (result?.docs ?? []).map((doc) => ({ id: String(doc.id), title: doc.title, issuer: doc.issuer ?? undefined, year: doc.year ?? undefined, url: doc.url ?? undefined }))
})

export const getPublications = cache(async (): Promise<Publication[]> => {
  const payload = await getClient()
  const result = await payload.find({ collection: 'publications', depth: 0, limit: 50, sort: 'order', where: { _status: { equals: 'published' } } }).catch(() => null)
  return (result?.docs ?? []).map((doc) => ({
    id: String(doc.id),
    title: doc.title,
    authors: doc.authors,
    year: doc.year ?? undefined,
    publisher: doc.publisher ?? undefined,
    venue: doc.venue ?? undefined,
    kind: doc.kind ?? 'conference',
    doi: doc.doi ?? undefined,
    externalUrl: doc.externalUrl ?? undefined,
    abstract: doc.abstract ?? undefined,
    personalContribution: doc.personalContribution ?? undefined,
    tags: names(doc.tags),
    featured: doc.featured ?? false,
  }))
})

export const getAbout = cache(async (): Promise<AboutContent> => {
  const payload = await getClient()
  const draft = await isDraft()
  const about = (await payload.findGlobal({ slug: 'about', depth: 1, draft, overrideAccess: draft }).catch(() => null)) as AboutDoc | null
  const sections: AboutSection[] = (about?.sections ?? [])
    .filter((section) => section.visible !== false && section.title)
    .map((section) => {
      const kind = section.kind ?? 'text'
      if (kind === 'text') return { kind: 'text', title: section.title, body: section.body }
      if (kind === 'technologies') {
        return {
          kind: 'technologies',
          title: section.title,
          groups: (section.technologyGroups ?? []).map((group) => ({ label: group.label, items: group.items.split(',').map((item) => item.trim()).filter(Boolean) })),
        }
      }
      return { kind, title: section.title }
    })
  return {
    eyebrow: about?.eyebrow || 'About',
    title: about?.title || 'Sheetaldharshan A',
    intro: (about?.intro ?? '').split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean),
    photo: toMediaRef(about?.photo),
    sections,
    meta: { title: about?.meta?.title ?? undefined, description: about?.meta?.description ?? undefined },
  }
})

/* ------------------------------------------------------------------ CMS pages */

export const getPage = cache(async (slug: string) => {
  const payload = await getClient()
  const draft = await isDraft()
  const result = await payload.find({ collection: 'pages', depth: 2, limit: 1, draft, overrideAccess: draft, pagination: false, where: { slug: { equals: slug } } }).catch(() => null)
  const doc = result?.docs?.[0]
  if (!doc) return null
  if (!draft && doc._status !== 'published') return null
  return doc
})

export const getPublishedPageSlugs = cache(async (): Promise<string[]> => {
  const payload = await getClient()
  const result = await payload.find({ collection: 'pages', depth: 0, limit: 200, select: { slug: true }, where: { _status: { equals: 'published' } } }).catch(() => null)
  return (result?.docs ?? []).map((doc) => doc.slug).filter((slug): slug is string => !!slug)
})

export function formatMonth(date?: string | null): string {
  if (!date) return ''
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

export function formatDate(date?: string | null): string {
  if (!date) return ''
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}
