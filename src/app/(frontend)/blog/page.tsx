import type { Metadata } from 'next'
import Link from 'next/link'
import { posts } from '@/data/site'

export const metadata: Metadata = { title: 'Notes — Sheetaldharshan' }

export default function BlogPage() {
  const published = posts.filter((post) => !post.draft)
  return <div className="page-wrap"><header className="page-header"><h1>Notes &amp;<br />questions.</h1><p>Technical writing will live here: backend systems, AI agents, developer tools, and the decisions that make them reliable.</p></header><div className="post-grid">{published.length === 0 ? <div className="post-card"><span className="eyebrow">Publishing soon</span><h2>The first note is being edited.</h2><p>An example draft exists in the CMS to demonstrate the workflow. Nothing unfinished is public.</p></div> : published.map((post) => <article className="post-card" key={post.slug}><div className="post-meta"><span>{post.category}</span><span>{post.date}</span></div><h2>{post.title}</h2><p>{post.excerpt}</p><Link className="text-link" href={`/blog/${post.slug}`}>Read note <span>↗</span></Link></article>)}</div></div>
}
