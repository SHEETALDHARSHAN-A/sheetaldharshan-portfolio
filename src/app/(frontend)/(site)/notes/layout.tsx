import { Suspense } from 'react'
import { KbNav } from '@/components/kb/KbNav'
import { KbSideTab } from '@/components/kb/KbSideControls'
import { ReaderFab } from '@/components/kb/ReaderFab'
import { SignInDialog } from '@/components/kb/SignIn'
import { getChannels, getKbSettings } from '@/data/content'

/**
 * Every ./stdout page shares this frame: the page on the left (it changes and animates), and the
 * side column on the right, which stays mounted while you move between posts and channels.
 */
export default async function StdoutLayout({ children }: { children: React.ReactNode }) {
  const [channels, kb] = await Promise.all([getChannels(), getKbSettings()])
  return (
    <div className="page kb-page">
      <div className="kb-layout">
        <div className="kb-main">{children}</div>
        <Suspense fallback={<aside className="kb-side" aria-hidden="true" />}>
          <KbNav channels={channels} stars={kb.rules.stars} signIn={kb.rules.signIn} side={kb.side} />
        </Suspense>
      </div>
      <Suspense fallback={null}>
        <SignInDialog />
      </Suspense>
      <ReaderFab />
      <KbSideTab />
    </div>
  )
}
