import type { Metadata } from 'next'
import Link from 'next/link'
import { Conversation } from '@/components/home/Conversation'
import { conversation, siteMeta } from '@/data/site'

export default function HomePage() {
  return (
    <div className="home-grid">
      <section className="home-intro">
        <span className="home-kicker">Software engineer · Exasol · India</span>
        <h1 className="home-title">Tools for <em>real</em> data.</h1>
        <div className="home-note">
          <p>Backend systems, AI agents, and interfaces that keep the underlying data in view.</p>
          <Link className="text-link" href="/about">More about me <span>↗</span></Link>
        </div>
      </section>
      <Conversation messages={conversation} />
    </div>
  )
}

export const metadata: Metadata = { title: siteMeta.title, description: siteMeta.description }
