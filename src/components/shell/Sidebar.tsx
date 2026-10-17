import Link from 'next/link'
import { BrandIcon } from '@/components/BrandIcon'
import { MobileMenu } from '@/components/shell/MobileMenu'
import { NavLinks } from '@/components/shell/NavLinks'
import { ActivityDock } from '@/components/activity/ActivityDock'
import { activityCards } from '@/components/activity/cards'
import type { CodingActivity } from '@/data/activity'
import type { Site } from '@/data/types'
import { AnimatedThemeToggler } from '@/components/magicui/animated-theme-toggler'
import { SidebarResizer } from '@/components/shell/SidebarResizer'

export function Sidebar({ site, activity, themeToggle = false }: { site: Site; activity?: CodingActivity; themeToggle?: boolean }) {
  return (
    <aside className="sidebar" style={{ viewTransitionName: 'site-sidebar' }}>
      <SidebarResizer />
      <Link href="/" className="wordmark" aria-label={`${site.displayName}, home`}>
        {site.displayName}
        <span className="dot">.</span>
      </Link>
      {/* The pet (components/pet) lives here; it is positioned over this slot. */}
      <div className="sidebar-avatar" aria-hidden="true" />
      {/* Coding activity (set up in the admin): round logos that open a card; the pet resizes to fit. */}
      {(() => {
        const cards = activity ? activityCards(activity).filter((c) => c.show.sidebar) : []
        return cards.length ? (
          <div className="sidebar-activity">
            <ActivityDock
              seconds={activity?.carouselSeconds}
              items={cards.map((c) => ({ id: c.id, title: c.title, summary: c.summary, icon: <BrandIcon name={c.brand} size={15} />, body: c.body('sidebar'), defaultOpen: c.show.sidebarOpen }))}
            />
          </div>
        ) : null
      })()}
      <div>
        <nav className="sidebar-nav" aria-label="Primary">
          <NavLinks items={site.nav} />
        </nav>
        <div className="sidebar-foot">
          {site.socialLinks.map((link) => (
            <a key={link.href} href={link.href} rel="noreferrer" target="_blank">
              <BrandIcon href={link.href} name={link.label} size={13} />
              {link.label}
            </a>
          ))}
          {site.footerLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
          {/* Light/dark switch for visitors (Site-wide → Theme), a small icon after the profile links. */}
          {themeToggle ? <AnimatedThemeToggler className="theme-toggle" /> : null}
        </div>
      </div>
    </aside>
  )
}

/** Phone chrome: a slim top bar with the wordmark, and a bottom tab bar so every section is one tap away. */
export function Topbar({ site, themeToggle = false }: { site: Site; themeToggle?: boolean }) {
  const primary = site.nav.slice(0, 5)
  return (
    <>
      <div className="topbar" style={{ viewTransitionName: 'site-topbar' }}>
        <Link href="/" className="wordmark" aria-label={`${site.displayName}, home`}>
          {site.displayName}
          <span className="dot">.</span>
        </Link>
        {themeToggle ? <AnimatedThemeToggler className="theme-toggle" /> : null}
        <MobileMenu>
          <NavLinks items={site.nav} />
        </MobileMenu>
      </div>
      <nav className="tabbar" aria-label="Sections" style={{ viewTransitionName: 'site-tabbar' }}>
        <NavLinks items={primary} />
      </nav>
    </>
  )
}
