import Link from 'next/link'
import type { Metadata } from 'next'
import { BrandIcon } from '@/components/BrandIcon'
import { ContactSwitch } from '@/components/contact/ContactSwitch'
import { PageFrame } from '@/components/shell/PageFrame'
import { getSite } from '@/data/content'
import { getContactSettings } from '@/data/contact'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact Sheetal (Sheetaldharshan A), software engineer at Exasol in Chennai, India: send a message, or reach me by email, GitHub or LinkedIn.',
  alternates: { canonical: '/contact' },
}

/** Contact: a message form, with every other way to reach me alongside it. */
export default async function ContactPage() {
  const [site, settings] = await Promise.all([getSite(), getContactSettings()])
  return (
    <PageFrame>
      <div className="page contact-page">
        <header className="page-head">
          <span className="eyebrow">Contact</span>
          <h1>{settings.heading}</h1>
          <p>{settings.intro}</p>
        </header>
        <div className="contact-layout">
          <ContactSwitch settings={settings} email={site.email} />
          <aside className="contact-side">
            {site.email ? (
              <section>
                <h2>Email</h2>
                <a className="contact-row" href={`mailto:${site.email}`}>
                  <BrandIcon href={`mailto:${site.email}`} size={18} />
                  <span>{site.email}</span>
                </a>
              </section>
            ) : null}
            <section>
              <h2>Profiles</h2>
              {site.socialLinks.map((link) => (
                <a className="contact-row" href={link.href} key={link.href} rel="noreferrer" target="_blank">
                  <BrandIcon href={link.href} name={link.label} size={18} />
                  <span>{link.label}</span>
                  <span className="contact-arrow" aria-hidden="true">
                    ↗
                  </span>
                </a>
              ))}
            </section>
            <section>
              <h2>Work</h2>
              <p>{site.currentRole ?? site.tagline}</p>
              {site.location ? <p className="contact-muted">{site.location}</p> : null}
            </section>
            {site.resumeUrl ? (
              <section>
                <h2>Résumé</h2>
                <a className="contact-row" href={site.resumeUrl} download>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M12 3v12m0 0-4-4m4 4 4-4M4 17v3h16v-3" />
                  </svg>
                  <span>Download (PDF)</span>
                </a>
              </section>
            ) : null}
            <p className="contact-privacy">
              Your details are only used to reply to you. <Link href="/privacy">Privacy</Link>
            </p>
          </aside>
        </div>
      </div>
    </PageFrame>
  )
}
