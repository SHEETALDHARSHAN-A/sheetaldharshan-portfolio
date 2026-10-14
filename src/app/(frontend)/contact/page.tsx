import type { Metadata } from 'next'
import { socialLinks } from '@/data/site'

export const metadata: Metadata = { title: 'Contact — Sheetaldharshan' }

export default function ContactPage() { return <div className="page-wrap"><header className="page-header"><h1>Let&apos;s<br />talk.</h1><p>No public email is listed yet. The approved links below are the best way to reach me.</p></header><div className="contact-grid"><h2 className="big-statement">Good conversations start with a concrete question.</h2><div className="copy-column"><p>For collaborations, technical conversations, or a thoughtful hello, reach out through one of these profiles.</p><div className="link-stack">{socialLinks.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label} <span>↗</span></a>)}</div></div></div></div> }
