import type { Metadata } from 'next'
import { KbShell } from '@/components/kb/KbShell'
import { YourChannel } from '@/components/kb/YourChannel'

export const metadata: Metadata = { title: 'Your channel', robots: { index: false } }

type Props = { params: Promise<{ id: string }> }

/** One of a reader's own channels: private, so it is loaded in the browser for its owner only. */
export default async function SavedChannelPage({ params }: Props) {
  const { id } = await params
  return (
    <KbShell active={`saved-${id}`}>
      <YourChannel id={id} />
    </KbShell>
  )
}
