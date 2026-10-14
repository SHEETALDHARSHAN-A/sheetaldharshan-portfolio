import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { Conversation } from '@/components/home/Conversation'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { JsonLd } from '@/components/seo/JsonLd'
import { getHomepage, getSite } from '@/data/content'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [conversation, site, { isEnabled: draft }] = await Promise.all([getHomepage(), getSite(), draftMode()])
  return (
    <main className="jg" id="main">
      {draft && <LivePreviewListener />}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: site.fullName,
          alternateName: site.displayName,
          url: site.canonicalUrl,
          jobTitle: site.currentRole,
          description: site.description,
          sameAs: site.socialLinks.map((link) => link.href),
        }}
      />
      <h1 className="sr-only">{site.fullName}</h1>
      <Conversation data={conversation} />
    </main>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const [conversation, site] = await Promise.all([getHomepage(), getSite()])
  return {
    title: { absolute: conversation.meta.title || site.fullName },
    description: conversation.meta.description || site.tagline,
    alternates: { canonical: '/' },
  }
}
