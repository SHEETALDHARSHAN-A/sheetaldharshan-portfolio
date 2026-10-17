import React from 'react'
import { Pet } from '@/components/pet/Pet'
import { NavFlag } from '@/components/shell/NavFlag'
import { Sidebar, Topbar } from '@/components/shell/Sidebar'
import { getCodingActivity } from '@/data/activity'
import { getPetSettings } from '@/data/brand'
import { getAppearance, getSidebarStyle, getSite } from '@/data/content'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [site, activity, pet, sidebarStyle, theme] = await Promise.all([getSite(), getCodingActivity(), getPetSettings(), getSidebarStyle(), getAppearance()])
  return (
    <div className="shell" style={sidebarStyle as React.CSSProperties}>
      <Sidebar site={site} activity={activity} themeToggle={theme.toggle} />
      <div className="main">
        <Topbar site={site} themeToggle={theme.toggle} />
        <main id="main">
          <NavFlag />
          {children}
        </main>
      </div>
      {pet.enabled ? <Pet sprite={pet.sprite} showOnPhones={pet.showOnPhones} behaviour={pet.behaviour} /> : null}
    </div>
  )
}
