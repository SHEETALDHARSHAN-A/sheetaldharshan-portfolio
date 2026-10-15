import type { Metadata, Viewport } from 'next'
import { Barlow_Condensed, Inter } from 'next/font/google'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { draftMode } from 'next/headers'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { getAppearance, getSite } from '@/data/content'
import { defaultTitle, nameVariants } from '@/data/seo'
import { themeAttributes } from '@/styles/theme'
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
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <link href="/rss.xml" rel="alternate" title="Blog RSS" type="application/rss+xml" />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <AdminBar adminBarProps={{ preview: isEnabled }} />
        {children}
      </body>
    </html>
  )
}

export const viewport: Viewport = { themeColor: '#000000', colorScheme: 'dark' }

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite()
  const title = defaultTitle(site)
  const image = site.ogImage
    ? { url: site.ogImage.url, width: site.ogImage.width ?? 1200, height: site.ogImage.height ?? 630, alt: site.ogImage.alt || title }
    : { url: '/icon-512.png', width: 512, height: 512, alt: title }
  return {
    metadataBase: new URL(getServerSideURL()),
    title: { default: title, template: `%s · ${site.fullName}` },
    description: site.description,
    applicationName: site.fullName,
    authors: [{ name: site.fullName, url: site.canonicalUrl }],
    creator: site.fullName,
    keywords: [site.fullName, ...nameVariants(site), site.currentRole, site.location, 'software engineer', 'developer tools', 'AI agents', 'portfolio'].filter(Boolean) as string[],
    // Let search engines show the large image preview and full snippets.
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
    openGraph: { type: 'website', locale: 'en_IN', url: '/', siteName: site.fullName, title, description: site.description, images: [image] },
    twitter: { card: 'summary_large_image', title, description: site.description, images: [image] },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: '48x48' },
        { url: '/icon-96.png', type: 'image/png', sizes: '96x96' },
        { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    },
    manifest: '/site.webmanifest',
    verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
    alternates: { types: { 'application/rss+xml': '/rss.xml' } },
  }
}
