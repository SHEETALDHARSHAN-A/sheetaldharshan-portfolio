import type { Metadata, Viewport } from 'next'
import { Barlow_Condensed, Inter } from 'next/font/google'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { draftMode } from 'next/headers'
import Script from 'next/script'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { ThemeSync } from '@/components/shell/ThemeSync'
import { getAppearance, getSite } from '@/data/content'
import { brandName, defaultTitle, nameVariants } from '@/data/seo'
import { getBrandIcons } from '@/data/brand'
import { themeAttributes, themeBootScript, themeCss, themeFontsHref } from '@/styles/theme'
import { cn } from '@/utilities/ui'
import { getServerSideURL } from '@/utilities/getURL'

import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const barlow = Barlow_Condensed({ subsets: ['latin'], variable: '--font-barlow', weight: ['300', '400', '500', '600', '700'], display: 'swap' })

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [{ isEnabled }, theme] = await Promise.all([draftMode(), getAppearance()])

  return (
    <html
      className={cn(inter.variable, barlow.variable, GeistSans.variable, GeistMono.variable)}
      lang="en"
      suppressHydrationWarning
      {...themeAttributes(theme)}
    >
      <head>
        {themeFontsHref(theme) ? <link rel="stylesheet" href={themeFontsHref(theme)!} /> : null}
        {themeCss(theme) ? <style dangerouslySetInnerHTML={{ __html: themeCss(theme) }} /> : null}
        {/* Before the first paint, on every page (404 included): the visitor's light/dark choice and saved widths. */}
        <Script id="boot" strategy="beforeInteractive">{`document.documentElement.classList.add('js');${themeBootScript(theme)}`}</Script>
        <link href="/rss.xml" rel="alternate" title="Blog RSS" type="application/rss+xml" />
      </head>
      <body>
        <ThemeSync toggle={theme.toggle} fallback={theme.theme} />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <AdminBar adminBarProps={{ preview: isEnabled }} />
        {children}
      </body>
    </html>
  )
}

/** Bump when the favicon changes: browsers cache favicons separately and only refetch a new address. */
const ICON_VERSION = 'sd1'

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
    { media: '(prefers-color-scheme: light)', color: '#f1f2e9' },
  ],
  colorScheme: 'dark light',
}

export async function generateMetadata(): Promise<Metadata> {
  const [site, brand] = await Promise.all([getSite(), getBrandIcons()])
  const title = defaultTitle(site)
  const image = site.ogImage
    ? { url: site.ogImage.url, width: site.ogImage.width ?? 1200, height: site.ogImage.height ?? 630, alt: site.ogImage.alt || title }
    : { url: '/icon-512.png', width: 512, height: 512, alt: title }
  return {
    metadataBase: new URL(getServerSideURL()),
    title: { default: title, template: `%s · ${brandName(site)}` },
    description: site.description,
    applicationName: brandName(site),
    authors: [{ name: site.fullName, url: site.canonicalUrl }],
    creator: site.fullName,
    keywords: [site.fullName, ...nameVariants(site), site.currentRole, site.location, 'software engineer', 'developer tools', 'AI agents', 'portfolio'].filter(Boolean) as string[],
    // Let search engines show the large image preview and full snippets.
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
    openGraph: { type: 'website', locale: 'en_IN', url: '/', siteName: brandName(site), title, description: site.description, images: [image] },
    twitter: { card: 'summary_large_image', title, description: site.description, images: [image] },
    icons: {
      // The SVG follows the browser's light or dark mode (black or white mark); the rest are fallbacks.
      // Uploaded icons (Brand → Favicon & icons) replace the built-in SD logo; light and dark versions
      // are picked by the browser's colour mode.
      icon: brand.faviconLight
        ? [
            { url: brand.faviconLight.url, type: brand.faviconLight.mimeType, ...(brand.faviconDark ? { media: '(prefers-color-scheme: light)' } : {}) },
            ...(brand.faviconDark ? [{ url: brand.faviconDark.url, type: brand.faviconDark.mimeType, media: '(prefers-color-scheme: dark)' }] : []),
          ]
        : [
            { url: `/favicon.ico?v=${ICON_VERSION}`, sizes: '32x32' },
            { url: `/icon.svg?v=${ICON_VERSION}`, type: 'image/svg+xml' },
            { url: `/icon-96.png?v=${ICON_VERSION}`, type: 'image/png', sizes: '96x96' },
            { url: `/icon-192.png?v=${ICON_VERSION}`, type: 'image/png', sizes: '192x192' },
          ],
      apple: [{ url: brand.appleIcon?.url ?? `/apple-touch-icon.png?v=${ICON_VERSION}`, sizes: '180x180' }],
    },
    manifest: `/site.webmanifest?v=${ICON_VERSION}`,
    // Search Console and Bing Webmaster Tools ownership codes, set as Vercel environment variables.
    verification: {
      ...(process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : {}),
      ...(process.env.BING_SITE_VERIFICATION ? { other: { 'msvalidate.01': process.env.BING_SITE_VERIFICATION } } : {}),
    },
    alternates: { types: { 'application/rss+xml': '/rss.xml' } },
  }
}
