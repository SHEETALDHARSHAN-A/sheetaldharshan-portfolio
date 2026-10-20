import Link from 'next/link'
import { formatDate } from '@/data/content'
import type { PostSummary } from '@/data/types'

type Stats = { comments: number; rating: number; ratings: number }

/** One post in a channel, like a message: its channel, title, summary and how readers found it. */
export function PostRow({ post, stats, showChannel = true }: { post: PostSummary; stats?: Stats; showChannel?: boolean }) {
  return (
    <article className="kb-row">
      <div className="kb-row-meta">
        {showChannel && post.channel ? (
          <Link href={`/notes/c/${post.channel.slug}`} className="kb-chip">
            {post.channel.emoji ?? '#'} {post.channel.title}
          </Link>
        ) : null}
        <span>{formatDate(post.publishedAt)}</span>
        <span>{post.readingMinutes} min read</span>
      </div>
      <h2>
        <Link href={`/notes/${post.slug}`} transitionTypes={['nav-forward']}>
          {post.title}
        </Link>
      </h2>
      {post.excerpt ? <p>{post.excerpt}</p> : null}
      {stats && (stats.ratings > 0 || stats.comments > 0) ? (
        <div className="kb-row-stats">
          {stats.ratings > 0 ? (
            <span title={`${stats.ratings} rating${stats.ratings === 1 ? '' : 's'}`}>
              ★ {stats.rating.toFixed(1)} <i>({stats.ratings})</i>
            </span>
          ) : null}
          {stats.comments > 0 ? (
            <span>
              💬 {stats.comments} comment{stats.comments === 1 ? '' : 's'}
            </span>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}
