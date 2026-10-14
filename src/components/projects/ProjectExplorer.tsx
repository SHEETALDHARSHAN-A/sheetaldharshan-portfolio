'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { Project } from '@/data/site'

export function ProjectExplorer({ projects }: { projects: Project[] }) {
  const [selected, setSelected] = useState(0)
  const project = projects[selected]

  return (
    <section className="project-explorer" aria-label="Project explorer">
      <div className="project-list">
        <div className="explorer-label">Selected work</div>
        {projects.map((item, index) => (
          <button className={`project-selector ${selected === index ? 'selected' : ''}`} key={item.slug} onClick={() => setSelected(index)} aria-pressed={selected === index}>
            <span>{item.number}</span><strong>{item.title}</strong><em>{item.status}</em>
          </button>
        ))}
      </div>
      <div className="project-stage" style={{ '--project-accent': project.accent } as CSSProperties}>
        <div className="stage-grid" aria-hidden="true" />
        <div className="stage-window">
          <div className="stage-window-bar"><span /><span /><span /><small>{project.slug}.local</small></div>
          <div className="stage-window-body">
            <div className="stage-code"><b>agent</b><span>ready</span><i>↳ query database</i><i>↳ render useful answer</i></div>
            <div className="stage-orbit" aria-hidden="true"><span>DATA</span><span>AI</span><span>TOOLS</span></div>
          </div>
        </div>
        <div className="stage-caption"><span>{project.eyebrow}</span><span>{project.title}</span></div>
      </div>
      <div className="project-detail">
        <span className="eyebrow">{project.number} / {project.eyebrow}</span>
        <h2>{project.title}</h2>
        <p>{project.summary}</p>
        <ul className="proof-list">{project.proof.map((item) => <li key={item}>{item}</li>)}</ul>
        <Link className="text-link" href={`/projects/${project.slug}`}>Open project <span>↗</span></Link>
      </div>
    </section>
  )
}
