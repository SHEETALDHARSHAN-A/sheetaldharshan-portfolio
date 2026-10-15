import type { AboutContent, EducationEntry, ExperienceEntry, Site } from '@/data/types'

/* Search-engine data about the site owner, built only from CMS content. */

export const siteBase = (site: Site) => site.canonicalUrl.replace(/\/$/, '')

/** The name people use and search for. Titles and headings lead with it so "Sheetal" matches as a word. */
export const SHORT_NAME = 'Sheetal'

/** "Sheetal (Sheetaldharshan A)": the short name people type, with the full name it belongs to. */
export const brandName = (site: Site) => `${SHORT_NAME} (${site.fullName})`

/** Page title used when a page does not set its own: name first, then what the person does. */
export const defaultTitle = (site: Site) => [brandName(site), site.currentRole].filter(Boolean).join(' · ')

/** Spellings people type when looking for the owner, so search engines tie them to one person. */
export function nameVariants(site: Site): string[] {
  const spaced = site.displayName.replace(/^(sheetal)(dharshan)$/i, (_, a: string, b: string) => `${a} ${b[0].toUpperCase()}${b.slice(1)}`)
  const initial = site.fullName.slice(site.displayName.length).trim()
  return [...new Set([SHORT_NAME, site.displayName, spaced, initial ? `${spaced} ${initial}` : '', site.fullName].filter((name) => name && name !== site.fullName))]
}

/** Breadcrumb trail for search results ("sheetaldharshan.me › Projects › Exasol Studio"). */
export function breadcrumbSchema(site: Site, trail: { name: string; path: string }[]) {
  const base = siteBase(site)
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: brandName(site), path: '/' }, ...trail].map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, item: `${base}${item.path}` })),
  }
}

function address(location?: string) {
  if (!location) return undefined
  const [locality, ...rest] = location.split(',').map((part) => part.trim())
  return { '@type': 'PostalAddress', addressLocality: locality, addressCountry: rest.join(', ') || undefined }
}

export function personSchema(
  site: Site,
  extra: { photo?: { url: string; width?: number; height?: number }; about?: AboutContent; experience?: ExperienceEntry[]; education?: EducationEntry[] } = {},
) {
  const base = siteBase(site)
  const current = extra.experience?.find((entry) => entry.current)
  const skills = (extra.about?.sections ?? []).flatMap((section) => (section.kind === 'technologies' ? section.groups.filter((g) => !/learning/i.test(g.label)).flatMap((g) => g.items) : []))
  return {
    '@type': 'Person',
    '@id': `${base}/#person`,
    name: site.fullName,
    alternateName: nameVariants(site),
    givenName: SHORT_NAME,
    url: base,
    description: site.description,
    image: extra.photo ? { '@type': 'ImageObject', url: extra.photo.url, width: extra.photo.width, height: extra.photo.height } : undefined,
    jobTitle: current?.role ?? site.currentRole,
    worksFor: current ? { '@type': 'Organization', name: current.company, url: current.companyUrl } : undefined,
    alumniOf: (extra.education ?? []).map((entry) => ({ '@type': 'CollegeOrUniversity', name: entry.institution })),
    address: address(site.location),
    email: site.email ? `mailto:${site.email}` : undefined,
    knowsAbout: skills.length ? skills : undefined,
    sameAs: site.socialLinks.map((link) => link.href),
  }
}

export function websiteSchema(site: Site) {
  const base = siteBase(site)
  return {
    '@type': 'WebSite',
    '@id': `${base}/#website`,
    url: base,
    name: brandName(site),
    alternateName: [site.fullName, ...nameVariants(site)],
    description: site.description,
    inLanguage: 'en',
    publisher: { '@id': `${base}/#person` },
  }
}
