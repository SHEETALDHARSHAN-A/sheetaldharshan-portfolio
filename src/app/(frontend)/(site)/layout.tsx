import React from 'react'
import { PageTransition } from '@/components/shell/PageTransition'
import { Sidebar, Topbar } from '@/components/shell/Sidebar'
import { getSite } from '@/data/content'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const site = await getSite()
  return (
    <div className="shell">
      <Sidebar site={site} />
      <div className="main">
        <Topbar site={site} />
        <main id="main">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  )
}
