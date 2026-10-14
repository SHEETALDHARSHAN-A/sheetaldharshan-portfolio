export type ConversationLink = {
  label: string
  href: string
}

export type ConversationMessage = {
  id: string
  content: string
  tone?: 'default' | 'muted' | 'accent'
  delay: number
  links?: ConversationLink[]
}

export type Project = {
  slug: string
  number: string
  title: string
  eyebrow: string
  summary: string
  description: string
  technologies: string[]
  status: 'Featured' | 'Contribution' | 'Academic'
  github?: string
  accent: string
  proof: string[]
}

export type Post = {
  slug: string
  title: string
  category: string
  date: string
  readingTime: string
  excerpt: string
  body: string[]
  tags: string[]
  draft?: boolean
}

export const conversation: ConversationMessage[] = [
  { id: 'hello', content: 'Hey there.', delay: 450 },
  { id: 'name', content: "I'm Sheetaldharshan.", delay: 800 },
  {
    id: 'work',
    content: 'I build developer tools and AI agents that work over real databases.',
    delay: 1000,
  },
  {
    id: 'current',
    content: "I'm currently a software engineer at Exasol.",
    delay: 900,
    tone: 'muted',
  },
  {
    id: 'outside',
    content: 'Outside work, I build things that make working with data a little easier.',
    delay: 1000,
  },
  {
    id: 'question',
    content: 'Want to take a look?',
    delay: 900,
    tone: 'accent',
    links: [
      { label: "See what I've built", href: '/projects' },
      { label: "Read what I'm learning", href: '/blog' },
      { label: 'A little about me', href: '/about' },
    ],
  },
]

export const projects: Project[] = [
  {
    slug: 'exasol-studio',
    number: '01',
    title: 'Exasol Studio',
    eyebrow: 'Personal project',
    summary: 'A desktop workspace for exploring Exasol with an integrated AI assistant.',
    description:
      'An independent exploration of how database tooling can feel more conversational without hiding the underlying SQL. The project brings together a Tauri shell, a React interface, and agent workflows for database exploration.',
    technologies: ['Tauri', 'Rust', 'React', 'TypeScript', 'LangGraph', 'MCP'],
    status: 'Featured',
    github: 'https://github.com/Sheetaldharshan200/Exasol-studio',
    accent: '#d6ff5f',
    proof: ['Database exploration', 'Natural-language interaction', 'AI-assisted workflows'],
  },
  {
    slug: 'exasol-personal-local-starter-kit',
    number: '02',
    title: 'Exasol Personal Local Starter Kit',
    eyebrow: 'Open-source contribution',
    summary: 'A local analytics database setup with an AI-development workflow through MCP.',
    description:
      'Collaborative engineering work on a public starter kit that makes local Exasol setup and AI client configuration easier. Contributions span MCP access, installer reliability, data-loading paths, and lifecycle commands.',
    technologies: ['Python', 'Shell', 'MCP', 'Exasol', 'Developer tooling'],
    status: 'Contribution',
    github: 'https://github.com/exasol-labs/exasol-personal-local-starterkit',
    accent: '#a9d8ff',
    proof: ['MCP access configuration', 'Cross-platform installers', 'Data-loading workflows'],
  },
  {
    slug: 'signsense',
    number: '03',
    title: 'SignSense',
    eyebrow: 'Academic team project',
    summary: 'A sign-language learning application using computer vision and deep learning.',
    description:
      'Historical academic work involving technical leadership, system design, and model development. The project is kept as a quieter part of the archive while its public materials are reviewed.',
    technologies: ['Python', 'Computer vision', 'Deep learning'],
    status: 'Academic',
    accent: '#ff9d70',
    proof: ['Technical leadership', 'System design', 'Model development'],
  },
]

export const posts: Post[] = [
  {
    slug: 'building-tools-around-the-database',
    title: 'Building tools around the database',
    category: 'Engineering notes',
    date: 'Needs review',
    readingTime: 'Draft',
    excerpt: 'A placeholder draft for the publishing workflow. It is intentionally unpublished until the notes are written and reviewed.',
    body: ['This is an unpublished example draft for the Payload publishing workflow.', 'Replace this with a reviewed technical article before publishing.'],
    tags: ['Developer tools', 'Databases'],
    draft: true,
  },
]

export const publication = {
  title: 'An Autonomous Hiring Intelligence Using Goal-oriented AI Agents and Dynamic Skill Inference',
  authors: 'Co-authored research publication',
  venue: 'IEEE · ICMLAS 2026',
  doi: '10.1109/ICMLAS67792.2026.11483816',
  url: 'https://doi.org/10.1109/ICMLAS67792.2026.11483816',
  contribution: 'Built the underlying hiring-agent system as a co-author.',
}

export const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/SHEETALDHARSHAN-A' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/sheetaldharshan' },
]

export const siteMeta = {
  title: 'Sheetaldharshan — developer tools and AI agents',
  description: 'Sheetaldharshan builds developer tools and AI agents that work over real databases.',
  url: 'https://sheetaldharshan.me',
}
