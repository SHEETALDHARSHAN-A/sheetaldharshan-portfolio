import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import RichText from '@/components/RichText'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { Picture } from '@/components/Media/Picture'
import { JsonLd } from '@/components/seo/JsonLd'
import { formatDate, getPost, getSite } from '@/data/content'

type Props = { params: Promise<{ slug: string }> }

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Note not found' }
  const image = post.meta.image ?? post.cover
  return {
    title: post.meta.title || post.title,
    description: post.meta.description || post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: 'article', title: post.title, description: post.excerpt, publishedTime: post.publishedAt, images: image ? [{ url: image.sizes?.og?.url ?? image.url }] : undefined },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const [post, site, { isEnabled: draft }] = await Promise.all([getPost(slug), getSite(), draftMode()])
  if (!post) notFound()

  return (
    <div className="page">
      {draft && <LivePreviewListener />}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt,
          datePublished: post.publishedAt,
          author: { '@type': 'Person', name: site.fullName, url: site.canonicalUrl },
          mainEntityOfPage: `${site.canonicalUrl}/blog/${post.slug}`,
          ...(post.cover ? { image: post.cover.url } : {}),
        }}
      />
      <article>
        <header className="article-head">
          <span className="eyebrow">{post.categories[0] ?? 'Note'}</span>
          <h1>{post.title}</h1>
          <div className="meta">
            <span>{formatDate(post.publishedAt)}</span>
            <span>{post.readingMinutes} min read</span>
            <span>{site.fullName}</span>
          </div>
        </header>
        {post.cover && (
          <div className="article-cover">
            <Picture media={post.cover} priority size="large" sizes="(max-width: 960px) 100vw, 820px" />
          </div>
        )}
        <RichText className="prose" data={post.content as DefaultTypedEditorState} enableGutter={false} enableProse={false} />
        {post.related.length > 0 && (
          <aside className="article-related">
            <span className="eyebrow">Related</span>
            <div className="post-list">
              {post.related.map((item) => (
                <article className="post-item" key={item.id}>
                  <div className="meta">
                    <span>{formatDate(item.publishedAt)}</span>
                  </div>
                  <h2>
                    <Link href={`/blog/${item.slug}`}>{item.title}</Link>
                  </h2>
                </article>
              ))}
            </div>
          </aside>
        )}
      </article>
    </div>
  )
}
