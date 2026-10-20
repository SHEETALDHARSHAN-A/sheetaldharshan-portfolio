import type { Metadata } from 'next'
import { KbShell } from '@/components/kb/KbShell'
import { PostRow } from '@/components/kb/PostRow'
import { getKbSettings, getPostStats, getPosts } from '@/data/content'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const kb = await getKbSettings()
  return { title: kb.heading, description: kb.intro, alternates: { canonical: '/notes' } }
}

type Props = { searchParams: Promise<{ q?: string }> }

export default async function KnowledgeBasePage({ searchParams }: Props) {
  const { q } = await searchParams
  const query = q?.trim().slice(0, 80) || undefined
  const [kb, posts, stats] = await Promise.all([getKbSettings(), getPosts({ query }), getPostStats()])

  return (
    <KbShell active={query ? undefined : 'all'} query={query}>
      <header className="page-head kb-head">
        <h1 className="h1-accent">{kb.heading}</h1>
        <p>{query ? `Posts matching "${query}".` : kb.intro}</p>
      </header>
      {posts.length === 0 ? (
        <div className="empty">{query ? `Nothing matched "${query}".` : 'The first post is still being written. Drafts stay private until they are published.'}</div>
      ) : (
        <div className="kb-rows">
          {posts.map((post) => (
            <PostRow key={post.id} post={post} stats={stats[post.id]} />
          ))}
        </div>
      )}
    </KbShell>
  )
}
