import type { Metadata } from 'next'
import { BrandIcon } from '@/components/BrandIcon'
import { PageFrame } from '@/components/shell/PageFrame'
import { getSite } from '@/data/content'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact Sheetal (Sheetaldharshan A), software engineer at Exasol in Chennai, India: email, GitHub and LinkedIn.',
  alternates: { canonical: '/contact' },
}

export default async function ContactPage() {
  const site = await getSite()
  return (
    <PageFrame>
    <div className="page">
      <header className="page-head">
        <span className="eyebrow">Contact</span>
        <h1>Say hello</h1>
        <p>A concrete question gets the fastest answer. Here is where to find me.</p>
      </header>
      <div className="contact-grid">
        <section>
          <h2>Work</h2>
          <p>{site.currentRole ?? site.tagline}</p>
          {site.location && <p>{site.location}</p>}
        </section>
        <section>
          <h2>Profiles</h2>
          <div className="contact-links">
            {site.socialLinks.map((link) => (
              <a href={link.href} key={link.href} rel="noreferrer" target="_blank">
                <BrandIcon href={link.href} name={link.label} size={18} />
                {link.label} <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </section>
        <section>
          <h2>Email</h2>
          {site.email ? (
            <div className="contact-links">
              <a href={`mailto:${site.email}`}>
                <BrandIcon href={`mailto:${site.email}`} size={18} />
                {site.email}
              </a>
            </div>
          ) : (
            <p>No public email is listed. A message on LinkedIn or GitHub reaches me.</p>
          )}
        </section>
      </div>
    </div>
    </PageFrame>
  )
}
