import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="notfound" id="main">
      <div>
        <h1>404</h1>
        <p style={{ color: 'var(--muted)', margin: '0 0 22px' }}>That page does not exist, or it has not been published yet.</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link className="btn" href="/">
            Start again
          </Link>
          <Link className="btn ghost" href="/projects">
            See projects
          </Link>
        </div>
      </div>
    </main>
  )
}
