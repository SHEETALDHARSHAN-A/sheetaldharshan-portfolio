import type { NextConfig } from 'next'

export const redirects: NextConfig['redirects'] = async () => {
  const internetExplorerRedirect = {
    destination: '/ie-incompatible.html',
    has: [
      {
        type: 'header' as const,
        key: 'user-agent',
        value: '(.*Trident.*)', // all ie browsers
      },
    ],
    permanent: false,
    source: '/:path((?!ie-incompatible.html$).*)', // all pages except the incompatibility page
  }

  // Addresses from earlier versions of the site that search engines still have. Permanent
  // redirects make Google replace them with the current page instead of a dead link.
  const moved = [
    { source: '/work', destination: '/projects' },
    { source: '/work/:slug*', destination: '/projects' },
    { source: '/notes', destination: '/blog' },
    { source: '/notes/:slug*', destination: '/blog/:slug*' },
    { source: '/writing', destination: '/blog' },
    { source: '/publications', destination: '/research' },
  ].map((r) => ({ ...r, permanent: true }))

  return [...moved, internetExplorerRedirect]
}
