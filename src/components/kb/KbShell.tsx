import { Suspense } from 'react'
import { PageFrame } from '@/components/shell/PageFrame'
import { getChannels, getKbSettings } from '@/data/content'
import { KbNav } from './KbNav'

/**
 * One ./stdout page's own part: its header and content, in the left column. The side column lives
 * in notes/layout.tsx, so it stays put (no animation) while the page beside it changes.
 */
export async function KbShell({ head, children }: { head?: React.ReactNode; children: React.ReactNode }) {
  const [channels, kb] = await Promise.all([getChannels(), getKbSettings()])
  return (
    <PageFrame>
      <div className="kb-page-body">
        {head}
        {/* Narrower screens: search and the channel chips sit here, between the header and the posts. */}
        <div className="kb-narrow-nav">
          <Suspense fallback={null}>
            <KbNav channels={channels} stars={kb.rules.stars} signIn={kb.rules.signIn} side={kb.side} variant="bar" />
          </Suspense>
        </div>
        {children}
      </div>
    </PageFrame>
  )
}

/** The header every page on the site uses: a small label, the title, one line about it. */
export function KbHead({ eyebrow, title, intro, lowercase, children }: { eyebrow: string; title: React.ReactNode; intro?: string; lowercase?: boolean; children?: React.ReactNode }) {
  return (
    <header className="page-head kb-head">
      <div className="kb-head-row">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h1 className={lowercase ? 'kb-lower' : undefined}>{title}</h1>
        </div>
        {children}
      </div>
      {intro ? <p>{intro}</p> : null}
    </header>
  )
}

export { KbEmptyClient as KbEmpty } from './KbEmptyClient'
