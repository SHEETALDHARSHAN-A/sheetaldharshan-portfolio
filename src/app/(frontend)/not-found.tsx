import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Page not found', robots: { index: false } }

/** 404 as a face: the two fours are the eyes (they blink now and then), the zero is the mouth. */
export default function NotFound() {
  return (
    <main className="notfound" id="main">
      <h1 className="sr-only">404</h1>
      <div className="nf-face" aria-hidden="true">
        <span className="nf-eye">4</span>
        <span className="nf-eye">4</span>
        <span className="nf-mouth">0</span>
      </div>
      <p className="nf-text">That page does not exist, or it has not been published yet.</p>
      <div className="nf-actions">
        <Link className="btn" href="/">
          Start again
        </Link>
        <Link className="btn ghost" href="/projects">
          See projects
        </Link>
      </div>
    </main>
  )
}
