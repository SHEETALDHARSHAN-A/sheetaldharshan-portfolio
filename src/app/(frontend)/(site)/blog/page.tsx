import type { Metadata } from 'next'
import Link from 'next/link'
import { PageFrame } from '@/components/shell/PageFrame'
import { formatDate, getCategories, getPosts } from '@/data/content'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Writing', description: 'Technical writing on backend systems, AI agents, developer tools and databases.', alternates: { canonical: '/blog' } }

type Props = { searchParams: Promise<{ q?: string; category?: string }> }

export default async function BlogPage({ searchParams }: Props) {
  const { q, category } = await searchParams
  const query = q?.trim().slice(0, 80) || undefined
  const [posts, categories] = await Promise.all([getPosts({ query, category }), getCategories()])

  return (
    <PageFrame>
    <div className="page">
      <header className="page-head">
        <h1 className="h1-accent">Writing</h1>
        <p>Technical writing on backend systems, AI agents, developer tools and the decisions that make them reliable.</p>
      </header>

      <form action="/blog" className="search-form" method="get" role="search">
        <label className="sr-only" htmlFor="q">
          Search writing
        </label>
        <input defaultValue={query ?? ''} id="q" name="q" placeholder="Search posts" type="search" />
        {category && <input name="category" type="hidden" value={category} />}
        <button className="btn ghost" type="submit">
          Search
        </button>
      </form>

      {categories.length > 0 && (
        <nav aria-label="Categories" className="tag-list" style={{ marginBottom: 24, marginTop: 0 }}>
          <Link className="tag" href="/blog" aria-current={!category ? 'page' : undefined}>
            All
          </Link>
          {categories.map((item) => (
            <Link className="tag" href={`/blog?category=${encodeURIComponent(item.slug)}`} key={item.slug} aria-current={category === item.slug ? 'page' : undefined}>
              {item.title}
            </Link>
          ))}
        </nav>
      )}

      {posts.length === 0 ? (
        <div className="empty">{query ? `Nothing matched "${query}".` : 'The first post is still being written. Drafts stay private until they are published.'}</div>
      ) : (
        <div className="post-list">
          {posts.map((post) => (
            <article className="post-item" key={post.id}>
              <div className="meta">
                <span>{formatDate(post.publishedAt)}</span>
                <span>{post.readingMinutes} min read</span>
                {post.categories[0] && <span>{post.categories[0]}</span>}
              </div>
              <div>
                <h2>
                  <Link href={`/blog/${post.slug}`} transitionTypes={['nav-forward']}>{post.title}</Link>
                </h2>
                {post.excerpt && <p>{post.excerpt}</p>}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
    </PageFrame>
  )
}
