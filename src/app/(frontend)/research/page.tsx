import type { Metadata } from 'next'
import { publication } from '@/data/site'

export const metadata: Metadata = { title: 'Research — Sheetaldharshan' }

export default function ResearchPage() { return <div className="page-wrap"><header className="page-header"><h1>Research<br />&amp; signals.</h1><p>A small, editable record of published and ongoing technical work.</p></header><div className="research-grid"><h2 className="big-statement">One publication, with more questions behind it.</h2><div className="copy-column"><div className="info-block" style={{ marginTop: 0 }}><h2>{publication.venue}</h2><p>{publication.title}</p><p style={{ marginTop: 20 }}>{publication.contribution}</p><a className="external-link" href={publication.url} target="_blank" rel="noreferrer">Read the publication · DOI {publication.doi} ↗</a></div></div></div></div> }
