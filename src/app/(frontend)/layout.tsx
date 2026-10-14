import type { Metadata } from 'next'
import { Barlow_Condensed, Inter } from 'next/font/google'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { draftMode } from 'next/headers'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { getAppearance, getSite } from '@/data/content'
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
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
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

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite()
  return {
    metadataBase: new URL(getServerSideURL()),
    title: { default: `${site.displayName} · ${site.tagline}`, template: `%s · ${site.displayName}` },
    description: site.description,
    openGraph: {
      type: 'website',
      siteName: site.displayName,
      title: site.displayName,
      description: site.description,
      images: site.ogImage ? [{ url: site.ogImage.url }] : [{ url: '/og-default.png' }],
    },
    twitter: { card: 'summary_large_image' },
    alternates: { types: { 'application/rss+xml': '/rss.xml' } },
  }
}
