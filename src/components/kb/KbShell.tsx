import { PageFrame } from '@/components/shell/PageFrame'
import { getChannels } from '@/data/content'
import { KbNav } from './KbNav'

/** Every Field Notes page: the channel sidebar on the left, the page on the right. */
export async function KbShell({ active, query, children }: { active?: string; query?: string; children: React.ReactNode }) {
  const channels = await getChannels()
  return (
    <PageFrame>
      <div className="page kb">
        <KbNav channels={channels} active={active} query={query} />
        <div className="kb-main">{children}</div>
      </div>
    </PageFrame>
  )
}
