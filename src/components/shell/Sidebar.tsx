import Link from 'next/link'
import { MobileMenu } from '@/components/shell/MobileMenu'
import { NavLinks } from '@/components/shell/NavLinks'
import type { Site } from '@/data/types'

export function Sidebar({ site }: { site: Site }) {
  return (
    <aside className="sidebar" style={{ viewTransitionName: 'site-sidebar' }}>
      <Link href="/" className="wordmark" aria-label={`${site.displayName}, home`}>
        {site.displayName}
        <span className="dot">.</span>
      </Link>
      <div>
        <nav className="sidebar-nav" aria-label="Primary">
          <NavLinks items={site.nav} />
        </nav>
        <div className="sidebar-foot">
          {site.socialLinks.map((link) => (
            <a key={link.href} href={link.href} rel="noreferrer" target="_blank">
              {link.label}
            </a>
          ))}
          {site.footerLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  )
}

/** Phone chrome: a slim top bar with the wordmark, and a bottom tab bar so every section is one tap away. */
export function Topbar({ site }: { site: Site }) {
  const primary = site.nav.slice(0, 5)
  return (
    <>
      <div className="topbar" style={{ viewTransitionName: 'site-topbar' }}>
        <Link href="/" className="wordmark" aria-label={`${site.displayName}, home`}>
          {site.displayName}
          <span className="dot">.</span>
        </Link>
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
