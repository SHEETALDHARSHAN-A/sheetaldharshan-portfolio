import Link from 'next/link'
import { Picture } from '@/components/Media/Picture'
import type { ProjectSummary } from '@/data/types'

export function ProjectGrid({ projects }: { projects: ProjectSummary[] }) {
  return (
    <div className="project-grid">
      {projects.map((project) => (
        <Link className="project-card" href={`/projects/${project.slug}`} key={project.id}>
          <div className="media">
            {project.heroImage ? <Picture media={project.heroImage} size="medium" sizes="(max-width: 960px) 100vw, 33vw" /> : project.thumbnail ? <Picture media={project.thumbnail} size="medium" sizes="33vw" /> : null}
          </div>
          <div className="body">
            <span className="eyebrow">{project.category ?? project.kindLabel}</span>
            <h2>{project.title}</h2>
            <p>{project.summary}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
