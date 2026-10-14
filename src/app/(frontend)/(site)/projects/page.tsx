import type { Metadata } from 'next'
import { ProjectExplorer } from '@/components/projects/ProjectExplorer'
import { ProjectGrid } from '@/components/projects/ProjectGrid'
import { getAppearance, getProjects } from '@/data/content'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Selected developer tools, AI agents and database work by Sheetaldharshan.',
  alternates: { canonical: '/projects' },
}

export default async function ProjectsPage() {
  const [projects, theme] = await Promise.all([getProjects(), getAppearance()])

  if (projects.length === 0) {
    return (
      <div className="page">
        <header className="page-head">
          <span className="eyebrow">Projects</span>
          <h1>Nothing published yet</h1>
          <p>Projects appear here as soon as one is published from the admin.</p>
        </header>
      </div>
    )
  }

  if (theme.projectDisplayStyle === 'grid') {
    return (
      <div className="page">
        <header className="page-head">
          <span className="eyebrow">Projects</span>
          <h1>Things I have built</h1>
        </header>
        <ProjectGrid projects={projects} />
      </div>
    )
  }

  return <ProjectExplorer projects={projects} />
}
