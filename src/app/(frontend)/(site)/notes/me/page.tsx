import type { Metadata } from 'next'
import { KbShell } from '@/components/kb/KbShell'
import { MyNotes } from '@/components/kb/MyNotes'

export const metadata: Metadata = { title: 'Your ./stdout', robots: { index: false } }

export default function MyNotesPage() {
  return (
    <KbShell>
      <MyNotes />
    </KbShell>
  )
}
