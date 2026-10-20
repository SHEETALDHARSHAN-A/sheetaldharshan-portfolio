import Link from 'next/link'

type PostLink = { slug?: string | null; title?: string | null; _status?: string | null }
type ChannelLink = { slug?: string | null; title?: string | null; emoji?: string | null }

/** "Before you read": posts (or a channel) worth reading first. At the top of a post or anywhere in it. */
export function Prereq({ title, posts, channel, note }: { title?: string | null; posts?: (PostLink | number | string)[] | null; channel?: ChannelLink | number | string | null; note?: string | null }) {
  const links = (posts ?? []).filter((p): p is PostLink => typeof p === 'object' && Boolean(p?.slug) && p._status !== 'draft')
  const ch = typeof channel === 'object' && channel?.slug ? channel : undefined
  if (!links.length && !ch) return null
  return (
    <aside className="kb-prereq" aria-label={title || 'Before you read'}>
      <p className="kb-prereq-title">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M4 19.5V5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2Zm0 0A2 2 0 0 0 6 21h12" />
        </svg>
        {title || 'Before you read'}
      </p>
      {note ? <p className="kb-prereq-note">{note}</p> : null}
      <ul>
        {links.map((p) => (
          <li key={p.slug}>
            <Link href={`/notes/${p.slug}`}>{p.title}</Link>
          </li>
        ))}
        {ch ? (
          <li>
            <Link href={`/notes/c/${ch.slug}`}>
              The {ch.emoji ?? '#'}
              {ch.title} channel
            </Link>
          </li>
        ) : null}
      </ul>
    </aside>
  )
}
