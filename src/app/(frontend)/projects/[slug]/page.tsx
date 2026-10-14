import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { projects } from '@/data/site'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() { return projects.map((project) => ({ slug: project.slug })) }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = projects.find((item) => item.slug === slug)
  return { title: project ? `${project.title} — Sheetaldharshan` : 'Project — Sheetaldharshan' }
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const project = projects.find((item) => item.slug === slug)
  if (!project) notFound()
  return <div className="page-wrap"><div className="detail-layout"><aside className="detail-sidebar"><span className="eyebrow">{project.number} / {project.status}</span><h2>{project.title}</h2><span className="eyebrow">{project.eyebrow}</span></aside><article className="detail-copy"><p>{project.description}</p><section><h3>Technologies</h3><ul>{project.technologies.map((technology) => <li key={technology}>{technology}</li>)}</ul></section><section><h3>What&apos;s in the work</h3><div className="body-copy"><p>{project.summary}</p><p>This page is intentionally written from verified public information. Deeper case-study material will be added from the CMS after review.</p></div></section>{project.github && <a className="external-link" href={project.github} target="_blank" rel="noreferrer">View public repository ↗</a>}</article></div></div>
}
