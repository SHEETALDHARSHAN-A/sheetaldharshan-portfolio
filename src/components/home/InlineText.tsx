import Link from 'next/link'
import { Fragment } from 'react'

const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g

function isSafeHref(href: string) {
  if (href.startsWith('/')) return true
  try {
    const url = new URL(href)
    return url.protocol === 'https:' || url.protocol === 'http:' || url.protocol === 'mailto:'
  } catch {
    return false
  }
}

/** Renders text with [label](href) links. Anything that is not a safe link renders as plain text. */
export function InlineText({ text }: { text: string }) {
  const parts: React.ReactNode[] = []
  let last = 0
  let match: RegExpExecArray | null
  let i = 0
  while ((match = LINK.exec(text)) !== null) {
    const [full, label, href] = match
    if (match.index > last) parts.push(<Fragment key={`t${i++}`}>{text.slice(last, match.index)}</Fragment>)
    if (isSafeHref(href)) {
      parts.push(
        href.startsWith('/') ? (
          <Link className="inline-link" href={href} key={`l${i++}`}>
            {label}
          </Link>
        ) : (
          <a className="inline-link" href={href} key={`l${i++}`} rel="noreferrer" target={href.startsWith('mailto:') ? undefined : '_blank'}>
            {label}
          </a>
        ),
      )
    } else {
      parts.push(<Fragment key={`x${i++}`}>{label}</Fragment>)
    }
    last = match.index + full.length
  }
  if (last < text.length) parts.push(<Fragment key={`e${i++}`}>{text.slice(last)}</Fragment>)
  return <>{parts}</>
}
