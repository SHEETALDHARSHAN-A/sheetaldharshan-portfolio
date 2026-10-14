import Link from 'next/link'
import { NavLinks } from '@/components/shell/NavLinks'
import type { Site } from '@/data/types'

export function Sidebar({ site }: { site: Site }) {
  return (
    <aside className="sidebar">
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

export function Topbar({ site }: { site: Site }) {
  return (
    <div className="topbar">
      <Link href="/" className="wordmark" aria-label={`${site.displayName}, home`}>
        {site.displayName}
        <span className="dot">.</span>
      </Link>
      <details>
        <summary>Menu</summary>
        <nav className="menu" aria-label="Primary">
          <NavLinks items={site.nav} />
        </nav>
      </details>
    </div>
  )
}
