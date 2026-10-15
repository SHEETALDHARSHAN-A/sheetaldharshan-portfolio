import type { Metadata } from 'next'
import { BrandIcon } from '@/components/BrandIcon'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RenderProjectBlocks } from '@/components/blocks/RenderProjectBlocks'
import { PlayOverlay } from '@/components/projects/PlayOverlay'
import { HeroImage } from '@/components/projects/HeroImage'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { MediaAny, Picture } from '@/components/Media/Picture'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbSchema } from '@/data/seo'
import { PageFrame } from '@/components/shell/PageFrame'
import { getProject, getProjects, getSite } from '@/data/content'
import { draftMode } from 'next/headers'

type Props = { params: Promise<{ slug: string }> }

export const revalidate = 300
export const dynamicParams = true

export async function generateStaticParams() {
  const projects = await getProjects()
  return projects.map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) return { title: 'Project not found' }
  const image = project.meta.image ?? project.heroImage
  return {
    title: project.meta.title || project.title,
    description: project.meta.description || project.summary,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { type: 'article', title: project.title, description: project.summary, images: image ? [{ url: image.sizes?.og?.url ?? image.url }] : undefined },
  }
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const [project, all, site, { isEnabled: draft }] = await Promise.all([getProject(slug), getProjects(), getSite(), draftMode()])
  if (!project) notFound()

  const index = all.findIndex((item) => item.slug === project.slug)
  const next = all.length > 1 ? all[(index + 1) % all.length] : null
  const links = [
    project.githubUrl && { label: 'Source on GitHub', href: project.githubUrl },
    project.releasesUrl && { label: 'Releases', href: project.releasesUrl },
    project.liveDemoUrl && { label: 'Live demo', href: project.liveDemoUrl },
    project.documentationUrl && { label: 'Documentation', href: project.documentationUrl },
  ].filter((link): link is { label: string; href: string } => !!link)

  return (
    <PageFrame>
    <article className={`case ${project.layoutPreset === 'article' ? 'article' : ''}`}>
      {draft && <LivePreviewListener />}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CreativeWork',
          name: project.title,
          description: project.summary,
          url: `${site.canonicalUrl}/projects/${project.slug}`,
          author: { '@type': 'Person', name: site.fullName },
          ...(project.githubUrl ? { codeRepository: project.githubUrl } : {}),
        }}
      />
      <JsonLd data={breadcrumbSchema(site, [{ name: 'Projects', path: '/projects' }, { name: project.title, path: `/projects/${project.slug}` }])} />
      <aside className="case-info">
        <span className="eyebrow">{project.category ?? project.kindLabel}</span>
        <h1>{project.title}</h1>
        <p className="lede">{project.description ?? project.summary}</p>
        <dl className="case-meta">
          <div>
            <dt>Type</dt>
            <dd>{project.kindLabel}</dd>
          </div>
          {project.year && (
            <div>
              <dt>Year</dt>
              <dd>{project.year}</dd>
            </div>
          )}
          {project.role && (
            <div>
              <dt>Role</dt>
              <dd>{project.role}</dd>
            </div>
          )}
          {project.client && (
            <div>
              <dt>Organisation</dt>
              <dd>{project.client}</dd>
            </div>
          )}
          {project.technologies.length > 0 && (
            <div>
              <dt>Tools</dt>
              <dd>{project.technologies.join(', ')}</dd>
            </div>
          )}
          {links.length > 0 && (
            <div>
              <dt>Links</dt>
              <dd>
                {links.map((link) => (
                  <div key={link.href}>
                    <a href={link.href} rel="noreferrer" target="_blank">
                      <BrandIcon href={link.href} size={15} />
                      {link.label} ↗
                    </a>
                  </div>
                ))}
              </dd>
            </div>
          )}
        </dl>
        <Link className="case-back" href="/projects" transitionTypes={['nav-back']}>
          <span className="arrow" aria-hidden="true">
            ←
          </span>
          Back to projects
        </Link>
      </aside>

      <div className="case-body">
        {project.demoVideoUrl ? (
          <PlayOverlay image={project.heroImage} title={project.title} url={project.demoVideoUrl} video={project.heroVideo} />
        ) : project.heroVideo ? (
          <div className="case-hero">
            <video autoPlay loop muted playsInline poster={project.heroImage?.url} src={project.heroVideo.url} />
          </div>
        ) : project.heroImage ? (
          <HeroImage media={project.heroImage} title={project.title} />
        ) : (
          <div className="case-hero placeholder" data-accent={project.accent}>
            <span className="mark">{project.title}</span>
          </div>
        )}

        <RenderProjectBlocks blocks={project.layout} />

        {project.screenshots.length > 0 && (
          <section className="case-section">
            <h2>Interface</h2>
            <div className="gallery two">
              {project.screenshots.map((shot, i) => (
                <figure className="media-figure" key={i}>
                  <MediaAny media={shot.media} sizes="(max-width: 960px) 100vw, 70vw" />
                  {shot.caption && <figcaption>{shot.caption}</figcaption>}
                </figure>
              ))}
            </div>
          </section>
        )}

        {next && next.slug !== project.slug && (
          <Link className="case-next" href={`/projects/${next.slug}`} transitionTypes={['nav-forward']}>
            <span className="thumb">{next.thumbnail ? <Picture media={next.thumbnail} size="small" sizes="110px" /> : next.heroImage ? <Picture media={next.heroImage} size="small" sizes="110px" /> : <span className="thumb-blank" data-accent={next.accent} />}</span>
            <span>
              <span className="eyebrow muted">Next project</span>
              <span className="t">{next.title}</span>
            </span>
          </Link>
        )}
      </div>
    </article>
    </PageFrame>
  )
}
