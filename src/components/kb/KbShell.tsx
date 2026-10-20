import { PageFrame } from '@/components/shell/PageFrame'
import { getChannels, getKbSettings } from '@/data/content'
import { Suspense } from 'react'
import { KbNav } from './KbNav'
import { SignInDialog } from './SignIn'
import { ReaderFab } from './ReaderFab'

/** Every Field Notes page: the channel sidebar on the left, the page on the right. */
export async function KbShell({ active, query, children }: { active?: string; query?: string; children: React.ReactNode }) {
  const [channels, kb] = await Promise.all([getChannels(), getKbSettings()])
  return (
    <PageFrame>
      <div className="page kb">
        <KbNav channels={channels} active={active} query={query} stars={kb.rules.stars} signIn={kb.rules.signIn} />
        <div className="kb-main">{children}</div>
        <Suspense fallback={null}>
          <SignInDialog />
        </Suspense>
        <ReaderFab />
      </div>
    </PageFrame>
  )
}
