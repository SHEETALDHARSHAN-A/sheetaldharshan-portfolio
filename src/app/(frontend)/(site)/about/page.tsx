import type { Metadata } from 'next'
import Link from 'next/link'
import { draftMode } from 'next/headers'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import RichText from '@/components/RichText'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { AboutPhoto } from '@/components/Media/AboutPhoto'
import { ActivityDock } from '@/components/activity/ActivityDock'
import { AsideToggle } from '@/components/shell/AsideToggle'
import { activityCards } from '@/components/activity/cards'
import { getCodingActivity } from '@/data/activity'
import { PageFrame } from '@/components/shell/PageFrame'
import { aboutSectionId } from '@/data/types'
import { brandName, personSchema } from '@/data/seo'
import { JsonLd } from '@/components/seo/JsonLd'
import { BrandIcon } from '@/components/BrandIcon'
import { formatMonth, getAbout, getCertifications, getEducation, getExperience, getProjects, getPublications, getSite } from '@/data/content'

/** Supabase Storage downloads a public file (with this name) when asked; other hosts get the browser's own handling. */
function downloadUrl(url: string, name: string) {
  return /supabase\.co\/storage\/v1\/object\/public\//.test(url) ? `${url}${url.includes('?') ? '&' : '?'}download=${encodeURIComponent(name)}` : url
}

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const [about, site] = await Promise.all([getAbout(), getSite()])
  const description = about.meta.description || about.intro[0] || site.description
  const photo = about.photo
  return {
    title: about.meta.title || 'About',
    description,
    alternates: { canonical: '/about' },
    openGraph: {
      type: 'profile',
      url: '/about',
      title: `About ${brandName(site)}`,
      description,
      ...(photo ? { images: [{ url: photo.url, width: photo.width, height: photo.height, alt: photo.alt || site.fullName }] } : {}),
    },
  }
}

export default async function AboutPage() {
  const [about, site, activity, { isEnabled: draft }] = await Promise.all([getAbout(), getSite(), getCodingActivity(), draftMode()])
  const kinds = new Set(about.sections.map((section) => section.kind))
  const [experience, education, certifications, publications, projects] = await Promise.all([
    kinds.has('experience') ? getExperience() : [],
    kinds.has('education') ? getEducation() : [],
    kinds.has('certifications') ? getCertifications() : [],
    kinds.has('publications') ? getPublications() : [],
    kinds.has('projects') ? getProjects({ featuredOnly: true }) : [],
  ])

  return (
    <PageFrame>
    <div className="page">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ProfilePage',
          url: `${site.canonicalUrl}/about`,
          name: `About ${brandName(site)}`,
          mainEntity: personSchema(site, { photo: about.photo, about, experience: kinds.has('experience') ? experience : await getExperience(), education: kinds.has('education') ? education : await getEducation() }),
        }}
      />
      {draft && <LivePreviewListener />}
      {/* The title sits in the left column, so the photo column starts at the top and fits the first screen. */}
      <div className="about">
        <AsideToggle />
        <header className="page-head about-head">
          <span className="eyebrow">{about.eyebrow}</span>
          <h1>{about.title}</h1>
          {site.currentRole && <p>{[site.currentRole, site.location].filter(Boolean).join(' · ')}</p>}
          {/* Résumé (Site settings → Résumé): first thing a recruiter looks for, so it sits with the name. */}
          {site.resume ? (
            <a className="btn resume-btn" href={downloadUrl(site.resume.url, `${site.fullName} - Résumé.pdf`)} download={`${site.fullName} - Résumé.pdf`} target="_blank" rel="noreferrer">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 3v12m0 0-4-4m4 4 4-4M4 17v3h16v-3" />
              </svg>
              Download résumé
              <span className="resume-meta">PDF</span>
            </a>
          ) : null}
        </header>
        <div className="about-main">
          <div className="about-intro">
            {about.intro.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
          {about.sections.map((section, i) => (
            <section className="section" id={aboutSectionId(section)} key={i}>
              <h2>{section.title}</h2>
              {section.kind === 'text' && section.body ? <RichText className="prose" data={section.body as DefaultTypedEditorState} enableGutter={false} enableProse={false} /> : null}
              {section.kind === 'experience' &&
                experience.map((entry) => (
                  <div className="entry" key={entry.id}>
                    <span className="when">
                      {formatMonth(entry.startDate)} – {entry.current ? 'Present' : formatMonth(entry.endDate)}
                    </span>
                    <div>
                      <strong>
                        {entry.role},{' '}
                        <BrandIcon href={entry.companyUrl} name={entry.company} size={16} />
                        {entry.companyUrl ? <a className="inline-link" href={entry.companyUrl} rel="noreferrer" target="_blank">{entry.company}</a> : entry.company}
                      </strong>
                      {entry.location && <span className="sub">{entry.location}</span>}
                      {entry.summary && <p>{entry.summary}</p>}
                      {entry.highlights.length > 0 && (
                        <ul>
                          {entry.highlights.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      )}
                      {entry.technologies.length > 0 && (
                        <div className="chips">
                          {entry.technologies.map((tech) => (
                            <span key={tech}>{tech}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              {section.kind === 'education' &&
                education.map((entry) => (
                  <div className="entry" key={entry.id}>
                    <span className="when">
                      {formatMonth(entry.startDate)} – {formatMonth(entry.endDate)}
                    </span>
                    <div>
                      <strong>
                        <BrandIcon name={entry.institution} size={16} />
                        {entry.institution}
                      </strong>
                      <span className="sub">{[entry.degree, entry.field].filter(Boolean).join(', ')}</span>
                      {entry.notes && <p>{entry.notes}</p>}
                    </div>
                  </div>
                ))}
              {section.kind === 'certifications' &&
                certifications.map((entry) => (
                  <div className="entry" key={entry.id}>
                    <span className="when">{entry.year}</span>
                    <div>
                      <strong>{entry.url ? <a className="inline-link" href={entry.url} rel="noreferrer" target="_blank">{entry.title}</a> : entry.title}</strong>
                      {entry.issuer && (
                        <span className="sub">
                          <BrandIcon href={entry.url} name={entry.issuer} size={14} />
                          {entry.issuer}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              {section.kind === 'publications' &&
                publications.map((pub) => (
                  <div className="entry" key={pub.id}>
                    <span className="when">{pub.year}</span>
                    <div>
                      <strong>{pub.externalUrl ? <a className="inline-link" href={pub.externalUrl} rel="noreferrer" target="_blank">{pub.title}</a> : pub.title}</strong>
                      <span className="sub">
                        <BrandIcon name={pub.publisher} size={14} />
                        {[pub.publisher, pub.venue].filter(Boolean).join(' · ')}
                      </span>
                      {pub.personalContribution && <p>{pub.personalContribution}</p>}
                    </div>
                  </div>
                ))}
              {section.kind === 'projects' &&
                projects.map((project) => (
                  <div className="entry" key={project.id}>
                    <span className="when">{project.year}</span>
                    <div>
                      <strong>
                        <Link className="inline-link" href={`/projects/${project.slug}`}>
                          {project.title}
                        </Link>
                      </strong>
                      <span className="sub">{project.kindLabel}</span>
                      <p>{project.summary}</p>
                    </div>
                  </div>
                ))}
              {section.kind === 'technologies' && (
                <div className="tech-groups">
                  {section.groups.map((group) => (
                    <div className="g" key={group.label}>
                      <strong>{group.label}</strong>
                      <div className="chips" style={{ marginTop: 0 }}>
                        {group.items.map((item) => (
                          <span key={item}>{item}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
        <aside className="about-aside">
          <div className="about-photo" aria-hidden={!about.photo}>
            {about.photo ? <AboutPhoto media={about.photo} /> : <div className="placeholder">Photo coming soon</div>}
          </div>
          {/* Coding activity (set up in the admin): a carousel of the default cards above round logos. */}
          {(() => {
            const cards = activityCards(activity).filter((c) => c.show.about)
            return cards.length ? (
              <ActivityDock
                variant="inline"
                seconds={activity.carouselSeconds}
                items={cards.map((c) => ({ id: c.id, title: c.title, summary: c.summary, icon: <BrandIcon name={c.brand} size={16} />, body: c.body('about'), defaultOpen: c.show.aboutOpen }))}
              />
            ) : null
          })()}
        </aside>
      </div>
    </div>
    </PageFrame>
  )
}
