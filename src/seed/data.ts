/**
 * Verified initial content. Every fact here comes from the approved project brief
 * (public repositories, the IEEE record, and the owner's confirmed career facts).
 * Nothing is estimated or invented. Items marked `needsReview` stay unpublished.
 */

export const homepageMessages = [
  { content: 'Hey there.', style: 'default' },
  { content: "I'm Sheetaldharshan.", style: 'default' },
  { content: 'I build developer tools and AI agents that work over real databases.', style: 'default' },
  { content: "I'm currently a software engineer at [Exasol](https://www.exasol.com).", style: 'default' },
  { content: 'Outside work, I build things that make working with data a little easier.', style: 'default' },
  {
    content: 'Want to take a look?',
    style: 'default',
    choices: [
      { label: "See what I've built", href: '/projects' },
      { label: "Read what I'm learning", href: '/blog' },
      { label: 'A little about me', href: '/about' },
      { label: 'Get in touch', href: '/contact' },
    ],
  },
] as const

export const navigation = {
  items: [
    { label: 'Projects', href: '/projects', visible: true },
    { label: 'Notes', href: '/blog', visible: true },
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
  description: 'Software engineer at Exasol. Developer tools and AI agents that work over real databases. Python, FastAPI, MCP, LangGraph, TypeScript, Rust.',
  canonicalUrl: 'https://sheetaldharshan.me',
  currentRole: 'Software Engineer at Exasol',
  location: 'Chennai, India',
  socialLinks: [
    { label: 'GitHub', href: 'https://github.com/SHEETALDHARSHAN-A' },
    { label: 'GitHub (work)', href: 'https://github.com/Sheetaldharshan200' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/sheetaldharshan' },
  ],
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
      'Contributed to building and productionizing the Exasol Personal Local Starter Kit, a one-command setup for a local Exasol analytics database that connects AI development tools through MCP. Collaborative work with another engineer.',
    highlights: [
      'MCP access configuration and a dedicated read-only database login.',
      'AI client configuration for Claude, Codex, Cursor, Gemini CLI and GitHub Copilot.',
      'Installer reliability across macOS, Linux and Windows.',
      'Guided data-loading workflows.',
      'Update and uninstall functionality.',
    ],
    technologies: ['Python', 'Shell', 'PowerShell', 'MCP', 'Docker', 'Podman', 'Exasol'],
    order: 0,
  },
  {
    role: 'AI Intern',
    company: 'Prayag.AI',
    location: 'Palakkad, India',
    startDate: '2025-06-01',
    endDate: '2026-06-01',
    current: false,
    summary:
      'Worked on Python backend services, LLM integrations, AI agent workflows and database-backed applications. Internal systems; details are not public.',
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
    'I am a software engineer at Exasol. I build developer tools and AI agents that work over real databases, and I care about the parts most demos skip: the installer that has to work on a stranger’s laptop, the read-only login that cannot be misused, the SQL you get to see before it runs.',
    'Before Exasol I spent a year as an AI intern at Prayag.AI, working on Python backend services, LLM integrations, agent workflows and database-backed applications.',
    'I finished a B.Tech in Information Technology in June 2026. I am interested in backend engineering, AI engineering, developer tools, agentic systems, database technologies and forward-deployed engineering.',
  ].join('\n\n'),
  sections: [
    { title: 'Now', kind: 'experience', visible: true },
    { title: 'Selected projects', kind: 'projects', visible: true },
    {
      title: 'Technologies',
      kind: 'technologies',
      visible: true,
      technologyGroups: [
        { label: 'Used professionally', items: 'Python, FastAPI, PostgreSQL, Docker, MCP, LangChain, LangGraph, OpenAI Agents SDK, Redis, Apache Kafka, Qdrant, Shell scripting, PowerShell' },
        { label: 'Personal projects', items: 'TypeScript, React, Rust, Tauri, WebRTC, Spring Boot' },
        { label: 'Learning', items: 'C and C++ for data structures and algorithms' },
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
