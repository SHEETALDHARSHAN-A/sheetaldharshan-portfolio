import type { Metadata } from 'next'
import { JsonLd } from '@/components/seo/JsonLd'
import { PageFrame } from '@/components/shell/PageFrame'
import { getPublications, getSite } from '@/data/content'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Research', description: 'Publications and research by Sheetaldharshan A.', alternates: { canonical: '/research' } }

export default async function ResearchPage() {
  const [publications, site] = await Promise.all([getPublications(), getSite()])
  return (
    <PageFrame>
    <div className="page">
      <header className="page-head">
        <span className="eyebrow">Research</span>
        <h1>Publications</h1>
        <p>Published work, with an honest note on what my part was.</p>
      </header>
      {publications.length === 0 ? (
        <div className="empty">No publications are published yet.</div>
      ) : (
        <div style={{ display: 'grid', gap: 18 }}>
          {publications.map((pub) => (
            <article className="pub" key={pub.id}>
              <JsonLd
                data={{
                  '@context': 'https://schema.org',
                  '@type': 'ScholarlyArticle',
                  headline: pub.title,
                  author: pub.authors.split(',').map((name) => ({ '@type': 'Person', name: name.trim() })),
                  publisher: pub.publisher ? { '@type': 'Organization', name: pub.publisher } : undefined,
                  datePublished: pub.year ? String(pub.year) : undefined,
                  ...(pub.doi ? { identifier: `doi:${pub.doi}` } : {}),
                  ...(pub.externalUrl ? { url: pub.externalUrl } : {}),
                }}
              />
              <span className="eyebrow">{[pub.publisher, pub.venue, pub.year].filter(Boolean).join(' · ')}</span>
              <h2>{pub.title}</h2>
              <div className="meta">{pub.authors}</div>
              {pub.abstract && <p>{pub.abstract}</p>}
              {pub.personalContribution && (
                <p>
                  <strong style={{ color: 'var(--text)' }}>My part: </strong>
                  {pub.personalContribution}
                </p>
              )}
              <div className="meta" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {pub.doi && (
                  <a className="inline-link" href={`https://doi.org/${pub.doi}`} rel="noreferrer" target="_blank">
                    doi:{pub.doi}
                  </a>
                )}
                {pub.externalUrl && !pub.externalUrl.includes('doi.org') && (
                  <a className="inline-link" href={pub.externalUrl} rel="noreferrer" target="_blank">
                    Publisher page
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
      <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 30 }}>{site.fullName}</p>
    </div>
    </PageFrame>
  )
}
