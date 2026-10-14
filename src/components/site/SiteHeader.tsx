'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { label: 'Projects', href: '/projects' },
  { label: 'Notes', href: '/blog' },
  { label: 'About', href: '/about' },
]

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="site-header">
      <Link href="/" className="wordmark" aria-label="Sheetaldharshan home">
        <span className="wordmark-mark">S</span>
        <span>sheetaldharshan</span>
      </Link>
      <nav className="site-nav" aria-label="Primary navigation">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={pathname.startsWith(link.href) ? 'active' : ''}>
            {link.label}
          </Link>
        ))}
        <Link href="/contact" className="nav-contact">Let&apos;s talk <span aria-hidden="true">↗</span></Link>
      </nav>
    </header>
  )
}
