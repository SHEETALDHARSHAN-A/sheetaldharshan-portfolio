/**
 * Verified initial content. Every fact here comes from the approved project brief
 * (public repositories, the IEEE record, and the owner's confirmed career facts).
 * Nothing is estimated or invented. Items marked `needsReview` stay unpublished.
 */

export const homepageMessages: { content: string; style: string; choices?: { label: string; href: string }[] }[] = [
  { content: 'Hi there 👋.', style: 'default' },
  { content: "I'm Sheetaldharshan.", style: 'default' },
  { content: 'I build developer tools and AI agents that work over real databases.', style: 'default' },
  { content: "I'm currently a software engineer at [Exasol](https://www.exasol.com).", style: 'default' },
  { content: 'Outside work, I build things that make working with data a little easier.', style: 'default' },
  { content: 'Most of my work lives in [my projects](/projects). I also [write about what I learn](/blog) and [publish research](/research).', style: 'default' },
  { content: 'Want to chat? [Say hi](/contact), or [get to know me](/about) first.', style: 'default' },
]

export const navigation = {
  items: [
    { label: 'Projects', href: '/projects', visible: true },
    { label: 'Writing', href: '/blog', visible: true },
    { label: 'About', href: '/about', visible: true },
    { label: 'Research', href: '/research', visible: true },
    { label: 'Contact', href: '/contact', visible: true },
  ],
  footerLinks: [] as { label: string; href: string }[],
}

export const siteSettings = {
  displayName: 'Sheetaldharshan',
  fullName: 'Sheetaldharshan A',
  tagline: 'I build developer tools and AI agents that work over real databases.',
  description: 'Sheetal (Sheetaldharshan A) is a software engineer at Exasol in Chennai, India, building developer tools and AI agents that work over real databases.',
  canonicalUrl: 'https://www.sheetaldharshan.me',
  currentRole: 'Software Engineer at Exasol',
  location: 'Chennai, India',
  socialLinks: [
    { label: 'GitHub', href: 'https://github.com/SHEETALDHARSHAN-A' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/sheetaldharshan' },
  ],
  email: 'sheetaldharshan@gmail.com',
  contactFormEnabled: false,
  footerNote: 'Built with Next.js and Payload. Content managed from /admin.',
}

export const appearance = {
  theme: 'dark',
  accent: 'blue',
  fontPreset: 'inter',
  headingScale: 'regular',
  spacing: 'regular',
  radius: 'pill',
  linkStyle: 'underline',
  bubbleStyle: 'pill',
  animationIntensity: 'normal',
  animationSpeed: 'normal',
  projectDisplayStyle: 'explorer',
} as const

export const experience = [
  {
    role: 'Software Engineer',
    company: 'Exasol',
    companyUrl: 'https://www.exasol.com',
    location: 'Chennai, India',
    startDate: '2026-06-01',
    current: true,
    summary:
      'Co-built the Exasol Personal Local Starter Kit: one command installs a local analytics database and connects AI tools to it through MCP.',
    highlights: [
      'Read-only MCP login for AI clients.',
      'Configs for Claude, Codex, Cursor, Gemini CLI and Copilot.',
      'One installer for macOS, Linux and Windows.',
      'Guided data loading, updates and uninstall.',
    ],
    technologies: ['Python', 'Shell', 'PowerShell', 'MCP', 'Docker', 'Podman', 'Exasol'],
    order: 0,
  },
  {
    role: 'AI Intern',
    company: 'Prayag.AI',
    companyUrl: 'https://prayag.ai',
    location: 'Palakkad, India',
    startDate: '2025-06-01',
    endDate: '2026-06-01',
    current: false,
    summary:
      'Built Python backends, LLM integrations and agent workflows. Internal work, not public.',
    highlights: [],
    technologies: ['FastAPI', 'PostgreSQL', 'Redis', 'Kafka', 'Docker', 'OpenAI Agents SDK', 'LangChain', 'Qdrant', 'WebRTC'],
    order: 1,
  },
]

export const education = [
  {
    institution: 'Karpagam College of Engineering',
    degree: 'Bachelor of Technology',
    field: 'Information Technology',
    startDate: '2022-11-01',
    endDate: '2026-06-01',
    location: 'Coimbatore, India',
    order: 0,
  },
]

export const publications = [
  {
    title: 'An Autonomous Hiring Intelligence Using Goal-oriented AI Agents and Dynamic Skill Inference',
    authors: 'C. Agjelia Lydia, V. Athithyan, M. Chandru, S. Dravid, A. Sheetaldharshan',
    year: 2026,
    publisher: 'IEEE',
    venue: '2026 International Conference on Machine Learning and Autonomous Systems (ICMLAS)',
    kind: 'conference',
    doi: '10.1109/ICMLAS67792.2026.11483816',
    externalUrl: 'https://doi.org/10.1109/ICMLAS67792.2026.11483816',
    personalContribution: 'Co-author. I built the hiring-agent system the paper describes. The paper itself was written by my co-authors.',
    tags: ['AI agents', 'Hiring'],
    featured: true,
    order: 0,
  },
]

export const projects = [
  {
    title: 'Exasol Studio',
    slug: 'exasol-studio',
    summary: 'A desktop app for Exasol databases with a built-in AI assistant that writes SQL you can see before it runs.',
    description:
      'A personal project exploring how an AI assistant can help developers and analysts work with a database without hiding the SQL. Ask in plain words; the assistant finds the right tables, writes and runs the query, builds a dashboard or loads a file, and shows every step. Anything that changes data waits for approval.',
    kind: 'personal',
    category: 'Desktop app',
    year: '2026',
    role: 'Sole author',
    technologies: ['Tauri 2', 'Rust', 'React 19', 'TypeScript', 'LangGraph', 'LangChain', 'MCP'],
    tags: ['AI assistant', 'SQL', 'Desktop'],
    featured: true,
    displayOrder: 1,
    accent: 'blue',
    githubUrl: 'https://github.com/Sheetaldharshan200/Exasol-studio',
    releasesUrl: 'https://github.com/Sheetaldharshan200/Exasol-studio/releases',
    publish: true,
    layout: [
      {
        blockType: 'features',
        heading: 'What it does',
        items: [
          { title: 'Database exploration', text: 'Schema browser, connection management with encrypted password storage, data import and export.' },
          { title: 'Natural-language interaction', text: 'Ask a question; the assistant inspects the schema, writes the SQL and shows it before running.' },
          { title: 'SQL generation and review', text: 'Monaco SQL editor, multi-statement runs, an execution log and a query performance view.' },
          { title: 'AI-assisted workflows', text: 'Load a file into a table, build a dashboard from a question, export it as a PDF. Changes wait for Allow or Deny.' },
          { title: 'Dashboards', text: 'Build dashboards by hand or ask the assistant; built-in read-only system dashboards.' },
          { title: 'Cross-platform desktop', text: 'One codebase for macOS, Windows and Linux. Signed builds with auto-update; Homebrew and Scoop packages.' },
        ],
      },
      {
        blockType: 'stats',
        heading: 'Facts',
        items: [
          { value: '3', label: 'operating systems' },
          { value: '47', label: 'cases in the eval suite that gates each release' },
          { value: '1', label: 'author' },
        ],
      },
      {
        blockType: 'links',
        heading: 'Links',
        items: [
          { label: 'Repository', href: 'https://github.com/Sheetaldharshan200/Exasol-studio' },
          { label: 'Releases', href: 'https://github.com/Sheetaldharshan200/Exasol-studio/releases', note: 'Installers for macOS, Windows and Linux' },
        ],
      },
    ],
  },
  {
    title: 'Exasol Personal Local Starter Kit',
    slug: 'exasol-personal-local-starter-kit',
    summary: 'One command sets up a local Exasol analytics database and connects AI clients to it through MCP.',
    description:
      'An open-source starter kit that installs the Exasol Personal in-memory analytics database on a laptop, loads sample data and connects AI development tools such as Claude, Codex and Cursor through a read-only MCP login. Co-built with one other engineer at Exasol; my parts are listed below.',
    kind: 'contribution',
    category: 'Developer tool',
    year: '2026',
    role: 'Co-built with one other engineer',
    client: 'Exasol',
    technologies: ['Python', 'Shell', 'PowerShell', 'MCP', 'Exasol', 'Podman'],
    tags: ['Installer', 'MCP', 'Data'],
    featured: true,
    displayOrder: 0,
    accent: 'green',
    githubUrl: 'https://github.com/exasol-labs/exasol-personal-local-starterkit',
    publish: true,
    layout: [
      {
        blockType: 'features',
        heading: 'My contributions',
        items: [
          { title: 'MCP access configuration', text: 'A dedicated read-only database user with validated credentials, so AI clients can query but never change data.' },
          { title: 'AI client configuration', text: 'Generated configs for Claude, Codex, Cursor, Gemini CLI and GitHub Copilot, plus a doctor command to check them.' },
          { title: 'Installer reliability', text: 'Windows parity with macOS and Linux, and self-repair paths for Linux installs.' },
          { title: 'Data-loading workflows', text: 'Guided sample-data loading, schema selection and a dry run that shows what will load.' },
          { title: 'Update and uninstall', text: 'Commands that keep the kit and its components current and remove them cleanly.' },
        ],
      },
      {
        blockType: 'timeline',
        heading: 'Releases',
        items: [
          { when: 'July 2026', title: 'v0.1.0', text: 'First public release.' },
          { when: 'October 2026', title: 'v0.2.0', text: 'Add-on marketplace, updates, agent skills, Linux and Windows improvements.' },
        ],
      },
      {
        blockType: 'links',
        heading: 'Links',
        items: [{ label: 'Repository', href: 'https://github.com/exasol-labs/exasol-personal-local-starterkit', note: 'exasol-labs on GitHub' }],
      },
    ],
  },
  {
    title: 'SignSense',
    slug: 'signsense',
    summary: 'A sign-language learning app that recognises signs from the camera and grades the learner.',
    description:
      'Academic team project. Courses teach alphabets, numbers and common signs; a camera quiz asks the learner to perform a sign and a model grades it. Team of four; I was tech lead, wrote the system design and built the recognition model. Second place at an All-India hackathon at Sengunthar Engineering College, 2025.',
    kind: 'academic',
    category: 'Computer vision',
    year: '2025',
    role: 'Tech lead, system design, model development',
    technologies: ['Python', 'OpenCV', 'MediaPipe', 'scikit-learn', 'FastAPI'],
    tags: ['Hackathon', 'Deep learning'],
    featured: false,
    displayOrder: 10,
    accent: 'orange',
    publish: false,
    needsReview: 'Unpublished by default. Verify the public repository and screenshots before publishing.',
    layout: [],
  },
]

export const about = {
  eyebrow: 'About',
  title: 'Sheetaldharshan A',
  intro: [
    'I’m Sheetal. I build developer tools and AI agents that work over real databases, and I focus on the parts most demos skip: an installer that works on any laptop, a read-only login that can’t be misused, SQL you see before it runs.',
    'Before Exasol, I spent a year at Prayag.AI building Python backends and LLM agents. B.Tech in IT, 2026. Next, I want to do forward-deployed and backend engineering.',
  ].join('\n\n'),
  sections: [
    { title: 'Experience', kind: 'experience', visible: true },
    { title: 'Selected projects', kind: 'projects', visible: true },
    {
      title: 'Technologies',
      kind: 'technologies',
      visible: true,
      technologyGroups: [
        { label: 'At work', items: 'Python, FastAPI, PostgreSQL, Docker, MCP, LangChain, LangGraph, OpenAI Agents SDK, Redis, Apache Kafka, Qdrant, Shell scripting, PowerShell' },
        { label: 'Side projects', items: 'TypeScript, React, Rust, Tauri, WebRTC, Spring Boot' },
        { label: 'Learning', items: 'C and C++ for DSA' },
      ],
    },
    { title: 'Education', kind: 'education', visible: true },
    { title: 'Research', kind: 'publications', visible: true },
  ],
}

export const categories = ['Software Engineering', 'Backend Development', 'Artificial Intelligence', 'AI Agents', 'Databases', 'Developer Tools', 'Research', 'Engineering Notes']

export const exampleDraftPost = {
  title: 'Example draft: how publishing works here',
  slug: 'example-draft-publishing-workflow',
  description: 'An unpublished example that shows the blog workflow. Delete it or replace its content before publishing.',
  paragraphs: [
    'This is an example draft. It exists so the editing, preview and publish steps can be tried before the first real note is written.',
    'Drafts are never shown on the public site. Use Preview in the admin to see this page, then Publish when a real article is ready.',
    'Replace the title, the content and the excerpt in the SEO tab, pick a category, and publish.',
  ],
}
