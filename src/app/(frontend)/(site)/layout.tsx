import React from 'react'
import { Pet } from '@/components/pet/Pet'
import { NavFlag } from '@/components/shell/NavFlag'
import { Sidebar, Topbar } from '@/components/shell/Sidebar'
import { getCodingActivity } from '@/data/activity'
import { getPetSettings } from '@/data/brand'
import { getSite } from '@/data/content'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [site, activity, pet] = await Promise.all([getSite(), getCodingActivity(), getPetSettings()])
  return (
    <div className="shell">
      <Sidebar site={site} activity={activity} />
      <div className="main">
        <Topbar site={site} />
        <main id="main">
          <NavFlag />
          {children}
        </main>
      </div>
      {pet.enabled ? <Pet sprite={pet.sprite} showOnPhones={pet.showOnPhones} /> : null}
    </div>
  )
}
