import type { Metadata } from 'next'
import { ProjectExplorer } from '@/components/projects/ProjectExplorer'
import { projects } from '@/data/site'

export const metadata: Metadata = { title: 'Projects — Sheetaldharshan' }

export default function ProjectsPage() {
  return <div className="page-wrap"><header className="page-header"><h1>Things I&apos;ve<br />built.</h1><p>A selected archive of tools, systems, and experiments. Each project is a small argument for keeping the human and the data close together.</p></header><ProjectExplorer projects={projects} /></div>
}
