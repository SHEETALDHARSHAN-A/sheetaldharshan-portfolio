import Link from 'next/link'
import { formatDate } from '@/data/content'
import type { PostSummary } from '@/data/types'

type Stats = { comments: number; rating: number; ratings: number }

/** One post, as a card like the Research page's: where and when, the title, the summary, how readers found it. */
export function PostRow({ post, stats, showChannel = true }: { post: PostSummary; stats?: Stats; showChannel?: boolean }) {
  return (
    <article className="kb-card">
      <span className="eyebrow kb-card-meta">
        {[showChannel && post.channel ? `${post.channel.emoji ?? '#'} ${post.channel.title}` : null, formatDate(post.publishedAt), `${post.readingMinutes} min read`].filter(Boolean).join(' · ')}
      </span>
      <h2>
        <Link href={`/notes/${post.slug}`} transitionTypes={['nav-forward']} className="kb-card-link">
          {post.title}
        </Link>
      </h2>
      {post.excerpt ? <p>{post.excerpt}</p> : null}
      {stats && (stats.ratings > 0 || stats.comments > 0) ? (
        <div className="kb-card-stats">
          {stats.ratings > 0 ? (
            <span title={`${stats.ratings} rating${stats.ratings === 1 ? '' : 's'}`}>
              <b>★</b> {stats.rating.toFixed(1)} <i>({stats.ratings})</i>
            </span>
          ) : null}
          {stats.comments > 0 ? (
            <span>
              {stats.comments} comment{stats.comments === 1 ? '' : 's'}
            </span>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}
