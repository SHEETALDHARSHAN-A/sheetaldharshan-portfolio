import type { Metadata } from 'next'
import Link from 'next/link'
import { draftMode } from 'next/headers'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import RichText from '@/components/RichText'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { Picture } from '@/components/Media/Picture'
import { formatMonth, getAbout, getCertifications, getEducation, getExperience, getProjects, getPublications, getSite } from '@/data/content'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const about = await getAbout()
  return { title: about.meta.title || 'About', description: about.meta.description || undefined, alternates: { canonical: '/about' } }
}

export default async function AboutPage() {
  const [about, site, { isEnabled: draft }] = await Promise.all([getAbout(), getSite(), draftMode()])
  const kinds = new Set(about.sections.map((section) => section.kind))
  const [experience, education, certifications, publications, projects] = await Promise.all([
    kinds.has('experience') ? getExperience() : [],
    kinds.has('education') ? getEducation() : [],
    kinds.has('certifications') ? getCertifications() : [],
    kinds.has('publications') ? getPublications() : [],
    kinds.has('projects') ? getProjects({ featuredOnly: true }) : [],
  ])

  return (
    <div className="page">
      {draft && <LivePreviewListener />}
      <header className="page-head">
        <span className="eyebrow">{about.eyebrow}</span>
        <h1>{about.title}</h1>
        {site.currentRole && <p>{[site.currentRole, site.location].filter(Boolean).join(' · ')}</p>}
      </header>
      <div className="about">
        <div>
          <div className="about-intro">
            {about.intro.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
          {about.sections.map((section, i) => (
            <section className="section" key={i}>
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
                        {entry.role}, {entry.companyUrl ? <a className="inline-link" href={entry.companyUrl} rel="noreferrer" target="_blank">{entry.company}</a> : entry.company}
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
                      <strong>{entry.institution}</strong>
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
                      {entry.issuer && <span className="sub">{entry.issuer}</span>}
                    </div>
                  </div>
                ))}
              {section.kind === 'publications' &&
                publications.map((pub) => (
                  <div className="entry" key={pub.id}>
                    <span className="when">{pub.year}</span>
                    <div>
                      <strong>{pub.externalUrl ? <a className="inline-link" href={pub.externalUrl} rel="noreferrer" target="_blank">{pub.title}</a> : pub.title}</strong>
                      <span className="sub">{[pub.publisher, pub.venue].filter(Boolean).join(' · ')}</span>
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
          {site.resume && (
            <section className="section">
              <a className="btn ghost" href={site.resume.url} rel="noreferrer" target="_blank">
                Download résumé (PDF)
              </a>
            </section>
          )}
        </div>
        <div className="about-photo" aria-hidden={!about.photo}>
          {about.photo ? <Picture media={about.photo} size="large" sizes="(max-width: 960px) 100vw, 40vw" /> : <div className="placeholder">Photo coming soon</div>}
        </div>
      </div>
    </div>
  )
}
