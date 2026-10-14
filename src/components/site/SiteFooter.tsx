import Link from 'next/link'
import { socialLinks } from '@/data/site'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <span className="eyebrow">Sheetaldharshan A</span>
        <p>Building useful interfaces for serious data work.</p>
      </div>
      <div className="footer-links">
        {socialLinks.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label} ↗</a>)}
        <Link href="/admin">Admin</Link>
      </div>
      <span className="footer-year">© {new Date().getFullYear()}</span>
    </footer>
  )
}
