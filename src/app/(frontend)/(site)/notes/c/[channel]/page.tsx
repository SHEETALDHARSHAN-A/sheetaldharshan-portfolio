import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { KbEmpty, KbHead, KbShell } from '@/components/kb/KbShell'
import { PostRow } from '@/components/kb/PostRow'
import { StarButton } from '@/components/kb/StarButton'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbSchema } from '@/data/seo'
import { getChannels, getKbSettings, getPostStats, getPosts, getSite } from '@/data/content'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ channel: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { channel } = await params
  const c = (await getChannels()).find((x) => x.slug === channel)
  if (!c) return { title: 'Channel not found' }
  return { title: `#${c.title}`, description: c.description || `Posts in #${c.title}.`, alternates: { canonical: `/notes/c/${c.slug}` } }
}

export default async function ChannelPage({ params }: Props) {
  const { channel } = await params
  const [channels, posts, stats, kb, site] = await Promise.all([getChannels(), getPosts({ category: channel }), getPostStats(), getKbSettings(), getSite()])
  const c = channels.find((x) => x.slug === channel)
  if (!c) notFound()

  return (
    <KbShell
      head={
        <KbHead eyebrow={`${kb.heading} · ${kb.empty.channelEyebrow}`} title={`${c.emoji ?? '#'} ${c.title}`} intro={c.description || `${c.posts} post${c.posts === 1 ? '' : 's'} in this channel.`}>
          {kb.rules.stars ? <StarButton id={c.id} title={c.title} /> : null}
        </KbHead>
      }
    >
      <JsonLd data={breadcrumbSchema(site, [{ name: kb.heading, path: '/notes' }, { name: `#${c.title}`, path: `/notes/c/${c.slug}` }])} />
      {posts.length === 0 ? (
        <KbEmpty command={`ls ./stdout/${c.slug}`} lines={[kb.empty.channelLine]} />
      ) : (
        <div className="kb-cards">
          {posts.map((post) => (
            <PostRow key={post.id} post={post} stats={stats[post.id]} showChannel={false} />
          ))}
        </div>
      )}
    </KbShell>
  )
}
