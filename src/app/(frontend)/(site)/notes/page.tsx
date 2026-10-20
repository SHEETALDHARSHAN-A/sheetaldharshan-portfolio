import type { Metadata } from 'next'
import { KbEmpty, KbHead, KbShell } from '@/components/kb/KbShell'
import { PostRow } from '@/components/kb/PostRow'
import { getKbSettings, getPostStats, getPosts } from '@/data/content'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const kb = await getKbSettings()
  return { title: kb.heading, description: kb.intro, alternates: { canonical: '/notes' } }
}

type Props = { searchParams: Promise<{ q?: string }> }

export default async function StdoutPage({ searchParams }: Props) {
  const { q } = await searchParams
  const query = q?.trim().slice(0, 80) || undefined
  const [kb, posts, stats] = await Promise.all([getKbSettings(), getPosts({ query }), getPostStats()])

  return (
    <KbShell head={<KbHead eyebrow={query ? 'Search' : kb.empty.indexEyebrow} title={kb.heading} lowercase intro={query ? `Posts matching “${query}”.` : kb.intro} />}>
      {posts.length === 0 ? (
        query ? (
          <KbEmpty command={`grep -ri "${query}" ./stdout`} lines={[kb.empty.searchLine]} />
        ) : (
          <KbEmpty command={kb.empty.indexCommand} lines={[kb.empty.indexLine]} />
        )
      ) : (
        <div className="kb-cards">
          {posts.map((post) => (
            <PostRow key={post.id} post={post} stats={stats[post.id]} />
          ))}
        </div>
      )}
    </KbShell>
  )
}
