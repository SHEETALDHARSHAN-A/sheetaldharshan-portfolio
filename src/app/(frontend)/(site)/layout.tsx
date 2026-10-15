import React from 'react'
import { Pet } from '@/components/pet/Pet'
import { NavFlag } from '@/components/shell/NavFlag'
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
          <NavFlag />
          {children}
        </main>
      </div>
      <Pet />
    </div>
  )
}
