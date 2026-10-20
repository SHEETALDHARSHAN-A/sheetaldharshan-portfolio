import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import RichText from '@/components/RichText'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { Picture } from '@/components/Media/Picture'
import { JsonLd } from '@/components/seo/JsonLd'
import { KbShell } from '@/components/kb/KbShell'
import { Prereq } from '@/components/kb/Prereq'
import { Discussion } from '@/components/kb/Discussion'
import { SaveButton } from '@/components/kb/SaveButton'
import { SelectionFeedback } from '@/components/kb/SelectionFeedback'
import { breadcrumbSchema } from '@/data/seo'
import { formatDate, getKbSettings, getPost, getSite } from '@/data/content'
import { postRules } from '@/utilities/kbRules'

type Props = { params: Promise<{ slug: string }> }

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Post not found' }
  const image = post.meta.image ?? post.cover
  return {
    title: post.meta.title || post.title,
    description: post.meta.description || post.excerpt,
    alternates: { canonical: `/notes/${post.slug}` },
    openGraph: { type: 'article', title: post.title, description: post.excerpt, publishedTime: post.publishedAt, images: image ? [{ url: image.sizes?.og?.url ?? image.url }] : undefined },
  }
}

export default async function KbPostPage({ params }: Props) {
  const { slug } = await params
  const [post, site, kb, { isEnabled: draft }] = await Promise.all([getPost(slug), getSite(), getKbSettings(), draftMode()])
  if (!post) notFound()
  const rules = postRules(kb.rules, post.interaction)

  return (
    <KbShell active={post.channel?.slug} activePost={post.slug}>
      {draft && <LivePreviewListener />}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt,
          datePublished: post.publishedAt,
          author: { '@type': 'Person', name: site.fullName, url: site.canonicalUrl },
          mainEntityOfPage: `${site.canonicalUrl}/notes/${post.slug}`,
          ...(post.cover ? { image: post.cover.url } : {}),
        }}
      />
      <JsonLd
        data={breadcrumbSchema(site, [
          { name: kb.heading, path: '/notes' },
          ...(post.channel ? [{ name: `#${post.channel.title}`, path: `/notes/c/${post.channel.slug}` }] : []),
          { name: post.title, path: `/notes/${post.slug}` },
        ])}
      />
      <article className="kb-article">
        <header className="article-head">
          {post.channel ? (
            <Link className="kb-chip" href={`/notes/c/${post.channel.slug}`}>
              {post.channel.emoji ?? '#'} {post.channel.title}
            </Link>
          ) : null}
          <h1>{post.title}</h1>
          <div className="kb-article-bar">
            <div className="meta">
              <span>{formatDate(post.publishedAt)}</span>
              <span>{post.readingMinutes} min read</span>
              <span>{site.fullName}</span>
            </div>
            {kb.rules.signIn ? <SaveButton postId={post.id} /> : null}
          </div>
        </header>
        {post.cover && (
          <div className="article-cover">
            <Picture media={post.cover} priority size="large" sizes="(max-width: 960px) 100vw, 820px" />
          </div>
        )}
        <Prereq posts={post.prerequisites} />
        <SelectionFeedback postId={post.id} enabled={rules.feedback}>
          <RichText className="prose" data={post.content as DefaultTypedEditorState} enableGutter={false} enableProse={false} />
        </SelectionFeedback>
        {post.related.length > 0 && (
          <aside className="article-related">
            <span className="eyebrow">Related</span>
            <ul className="kb-related">
              {post.related.map((item) => (
                <li key={item.id}>
                  <Link href={`/notes/${item.slug}`}>{item.title}</Link>
                  <span>{formatDate(item.publishedAt)}</span>
                </li>
              ))}
            </ul>
          </aside>
        )}
        {rules.comments !== 'off' || rules.ratings ? <Discussion postId={post.id} /> : null}
      </article>
    </KbShell>
  )
}
