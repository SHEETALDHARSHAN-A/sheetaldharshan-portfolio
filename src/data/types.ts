/** View models used by the public frontend. Mapped from Payload documents in src/data/content.ts. */

export type MediaRef = {
  url: string
  alt: string
  width?: number
  height?: number
  mimeType?: string
  /** Focal point set in the media library, in percent (50/50 is the centre); crops keep it in view. */
  focalX?: number
  focalY?: number
  sizes?: Partial<Record<'thumbnail' | 'square' | 'small' | 'medium' | 'large' | 'xlarge' | 'og', { url: string; width?: number; height?: number }>>
}

export type Choice = { label: string; href: string; newTab?: boolean }

export type Message = {
  id: string
  content: string
  style: 'default' | 'accent' | 'muted'
  revealDelay: number
  choices: Choice[]
}

export type Conversation = {
  messages: Message[]
  animationPreset: 'calm' | 'snappy' | 'instant'
  typingIndicator: 'dots' | 'none'
  startDelay: number
  meta: { title?: string; description?: string }
  /** Colours from Homepage → Conversation look (validated #rrggbb). */
  look: { pageBackground?: string; bubbleColor?: string; textColor?: string; linkColor?: string }
}

export type NavItem = { label: string; href: string; newTab?: boolean }

export type Site = {
  displayName: string
  fullName: string
  tagline: string
  description: string
  canonicalUrl: string
  currentRole?: string
  location?: string
  socialLinks: NavItem[]
  email?: string
  contactFormEnabled: boolean
  resume?: MediaRef
  /** Where the Download résumé buttons point: the Résumé link, or the uploaded PDF. */
  resumeUrl?: string
  ogImage?: MediaRef
  footerNote?: string
  nav: NavItem[]
  footerLinks: NavItem[]
}

export type ProjectKind = 'personal' | 'contribution' | 'professional' | 'academic' | 'experiment'

export type ProjectSummary = {
  id: string
  slug: string
  title: string
  summary: string
  kind: ProjectKind
  kindLabel: string
  category?: string
  year?: string
  role?: string
  client?: string
  technologies: string[]
  tags: string[]
  featured: boolean
  accent: 'blue' | 'orange' | 'green' | 'violet' | 'neutral'
  thumbnail?: MediaRef
  heroImage?: MediaRef
  heroVideo?: MediaRef
  updatedAt?: string
  /** Per-project colours from the admin (validated #rrggbb); empty uses the page settings. */
  style: { cardColor?: string; cardTextColor?: string; pageBackground?: string; pageTextColor?: string }
  /** Extra images that loop after the hero on the project page. */
  heroLoop: MediaRef[]
  loopSeconds: number
  githubUrl?: string
  liveDemoUrl?: string
  documentationUrl?: string
  releasesUrl?: string
}

export type Project = ProjectSummary & {
  description?: string
  screenshots: { media: MediaRef; caption?: string }[]
  demoVideoUrl?: string
  layout: unknown[]
  layoutPreset: 'case-study' | 'article'
  meta: { title?: string; description?: string; image?: MediaRef }
}

export const kindLabels: Record<ProjectKind, string> = {
  personal: 'Personal project',
  contribution: 'Open-source contribution',
  professional: 'Professional work',
  academic: 'Academic project',
  experiment: 'Experiment',
}

export type Channel = { id: string; slug: string; title: string; emoji?: string; description?: string; posts: number }

export type PostSummary = {
  id: string
  slug: string
  title: string
  excerpt?: string
  publishedAt?: string
  categories: string[]
  /** The post's home channel: its first category. */
  channel?: { slug: string; title: string; emoji?: string }
  readingMinutes: number
  cover?: MediaRef
  updatedAt?: string
}

export type Post = PostSummary & {
  content: unknown
  related: PostSummary[]
  /** "Read first" posts, shown as "Before you read" at the top. */
  prerequisites: PostSummary[]
  /** The post's own "Reader interaction" overrides. */
  interaction: Record<string, 'default' | 'on' | 'off' | 'locked' | null | undefined>
  tags: string[]
  meta: { title?: string; description?: string; image?: MediaRef }
}

export type ExperienceEntry = {
  id: string
  role: string
  company: string
  companyUrl?: string
  location?: string
  startDate: string
  endDate?: string
  current: boolean
  summary?: string
  highlights: string[]
  technologies: string[]
}

export type EducationEntry = {
  id: string
  institution: string
  degree: string
  field?: string
  startDate?: string
  endDate?: string
  location?: string
  notes?: string
}

export type CertificationEntry = { id: string; title: string; issuer?: string; year?: string; url?: string }

export type Publication = {
  id: string
  title: string
  authors: string
  year?: number
  publisher?: string
  venue?: string
  kind: string
  doi?: string
  externalUrl?: string
  abstract?: string
  personalContribution?: string
  tags: string[]
  featured: boolean
}

export type AboutSection =
  | { kind: 'text'; title: string; body: unknown }
  | { kind: 'experience' | 'education' | 'projects' | 'publications' | 'certifications'; title: string }
  | { kind: 'technologies'; title: string; groups: { label: string; items: string[] }[] }

export type AboutContent = {
  eyebrow: string
  title: string
  intro: string[]
  photo?: MediaRef
  sections: AboutSection[]
  meta: { title?: string; description?: string }
}

/** Stable anchor for an About section, used by the page and by the site search. */
export function aboutSectionId(section: AboutSection): string {
  if (section.kind !== 'text') return section.kind
  return section.title.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section'
}

export type SearchDocType = 'page' | 'project' | 'post' | 'publication' | 'experience' | 'education' | 'certification' | 'skill' | 'link'

/** One searchable entry in /search-index.json. */
export type SearchDoc = {
  id: string
  type: SearchDocType
  title: string
  subtitle?: string
  href: string
  external?: boolean
  keywords?: string
  tags?: string
  body?: string
  featured?: boolean
}
