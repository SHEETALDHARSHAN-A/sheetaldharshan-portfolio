import { Suspense } from 'react'
import { PageFrame } from '@/components/shell/PageFrame'
import { getChannels, getKbSettings } from '@/data/content'
import { KbNav } from './KbNav'
import { ReaderFab } from './ReaderFab'
import { KbSideTab } from './KbSideControls'
import { SignInDialog } from './SignIn'

/**
 * Every ./stdout page, laid out like the Contact page: the page header across the top, the posts
 * (or one post) on the left, and a column on the right with search, channels and your account.
 */
export async function KbShell({ head, active, query, children }: { head?: React.ReactNode; active?: string; query?: string; children: React.ReactNode }) {
  const [channels, kb] = await Promise.all([getChannels(), getKbSettings()])
  return (
    <PageFrame>
      <div className="page kb-page">
        {head}
        <div className="kb-layout">
          <div className="kb-main">{children}</div>
          <KbNav channels={channels} active={active} query={query} stars={kb.rules.stars} signIn={kb.rules.signIn} />
        </div>
        <Suspense fallback={null}>
          <SignInDialog />
        </Suspense>
        <ReaderFab />
        <KbSideTab />
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
