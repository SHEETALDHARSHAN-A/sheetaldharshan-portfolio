/** View models used by the public frontend. Mapped from Payload documents in src/data/content.ts. */

export type MediaRef = {
  url: string
  alt: string
  width?: number
  height?: number
  mimeType?: string
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

export type PostSummary = {
  id: string
  slug: string
  title: string
  excerpt?: string
  publishedAt?: string
  categories: string[]
  readingMinutes: number
  cover?: MediaRef
}

export type Post = PostSummary & {
  content: unknown
  related: PostSummary[]
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
