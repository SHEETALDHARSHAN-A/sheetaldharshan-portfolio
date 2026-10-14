import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { posts } from '@/data/site'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() { return posts.filter((post) => !post.draft).map((post) => ({ slug: post.slug })) }

export async function generateMetadata({ params }: Props): Promise<Metadata> { const { slug } = await params; const post = posts.find((item) => item.slug === slug && !item.draft); return { title: post ? `${post.title} — Sheetaldharshan` : 'Note — Sheetaldharshan' } }

export default async function BlogPostPage({ params }: Props) { const { slug } = await params; const post = posts.find((item) => item.slug === slug && !item.draft); if (!post) notFound(); return <div className="page-wrap"><article className="article"><span className="eyebrow">{post.category} · {post.date} · {post.readingTime}</span><h1>{post.title}</h1><p className="article-intro">{post.excerpt}</p><div className="article-body">{post.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></article></div> }
