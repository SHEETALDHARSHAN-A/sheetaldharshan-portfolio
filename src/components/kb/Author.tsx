import { Avatar } from './Avatar'

export type Author = { name: string; avatar?: string; verified?: boolean; github?: string; anonymous?: boolean }

/** The blue tick: this reader signed in with GitHub. */
export function VerifiedTick({ size = 15 }: { size?: number }) {
  return (
    <svg className="kb-tick" width={size} height={size} viewBox="0 0 24 24" role="img" aria-label="Verified with GitHub">
      <title>Verified with GitHub</title>
      <path fill="#1d9bf0" d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91C2.63 9.33 1.75 10.57 1.75 12s.88 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34z" />
      <path fill="#fff" d="m9.99 16.6-3.7-3.7 1.42-1.42 2.28 2.3 5.6-6.1 1.48 1.35z" />
    </svg>
  )
}

function AnonymousAvatar({ size = 26 }: { size?: number }) {
  return (
    <span className="kb-avatar kb-avatar-anon" style={{ width: size, height: size }} aria-hidden="true">
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-4.4 0-8 2.2-8 5v1.5h16V19c0-2.8-3.6-5-8-5Z" />
      </svg>
    </span>
  )
}

/** Picture, name and blue tick; a verified name links to the reader's GitHub profile. */
export function AuthorLine({ author, size = 26 }: { author: Author; size?: number }) {
  const name = author.github ? (
    <a href={`https://github.com/${author.github}`} target="_blank" rel="noreferrer nofollow" className="kb-author-name" title={`@${author.github} on GitHub`}>
      {author.name}
    </a>
  ) : (
    <strong className="kb-author-name" data-anon={author.anonymous || undefined}>
      {author.name}
    </strong>
  )
  return (
    <>
      {author.anonymous ? <AnonymousAvatar size={size} /> : <Avatar name={author.name} src={author.avatar} size={size} />}
      {name}
      {author.verified ? <VerifiedTick /> : null}
    </>
  )
}
