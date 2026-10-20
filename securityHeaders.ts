import type { NextConfig } from 'next'

/**
 * Security headers for every response. The content security policy covers the public site; the
 * Payload admin gets the same baseline headers but its own looser script rules (it needs eval in
 * development and inline styles everywhere).
 *
 * What the site loads from elsewhere, and why:
 *   images/media: any https source (post photos can link to outside images), Supabase Storage
 *   fonts:        Google Fonts (chosen in Appearance)
 *   frames:       YouTube (no-cookie), Vimeo, Spotify and SoundCloud players in posts and projects
 */
const dev = process.env.NODE_ENV !== 'production'

const csp = [
  "default-src 'self'",
  // Next.js streams inline scripts for hydration; nothing else may run.
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  `connect-src 'self'${dev ? ' ws: http://localhost:*' : ''}`,
  'frame-src https://www.youtube-nocookie.com https://www.youtube.com https://player.vimeo.com https://open.spotify.com https://w.soundcloud.com',
  "frame-ancestors 'self'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
  ...(dev ? [] : ['upgrade-insecure-requests']),
].join('; ')

const baseline = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), bluetooth=(), browsing-topics=()' },
]

export const headers: NextConfig['headers'] = async () => [
  { source: '/:path*', headers: baseline },
  // The public site (everything except the admin and its API) gets the strict policy.
  { source: '/((?!admin|api).*)', headers: [{ key: 'Content-Security-Policy', value: csp }] },
  // Nothing private should end up in search results.
  { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
  { source: '/api/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex' }] },
  { source: '/auth/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex' }, { key: 'Cache-Control', value: 'no-store' }] },
  { source: '/notes/me', headers: [{ key: 'X-Robots-Tag', value: 'noindex' }, { key: 'Cache-Control', value: 'private, no-store' }] },
]
