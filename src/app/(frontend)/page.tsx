import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { Conversation } from '@/components/home/Conversation'
import { HomeGate } from '@/components/home/HomeGate'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { JsonLd } from '@/components/seo/JsonLd'
import { PageFrame } from '@/components/shell/PageFrame'
import { getAbout, getEducation, getExperience, getHomepage, getSite } from '@/data/content'
import { defaultTitle, personSchema, websiteSchema } from '@/data/seo'

export const revalidate = 300

export default async function HomePage() {
  const [conversation, site, about, experience, education, { isEnabled: draft }] = await Promise.all([getHomepage(), getSite(), getAbout(), getExperience(), getEducation(), draftMode()])
  return (
    <PageFrame>
    <main className="jg" id="main">
      {draft && <LivePreviewListener />}
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': [websiteSchema(site), personSchema(site, { photo: about.photo, about, experience, education })] }} />
      <h1 className="sr-only">{site.fullName}</h1>
      <HomeGate />
      <Conversation data={conversation} />
    </main>
    </PageFrame>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const [conversation, site] = await Promise.all([getHomepage(), getSite()])
  return {
    title: { absolute: conversation.meta.title && conversation.meta.title !== site.fullName ? conversation.meta.title : defaultTitle(site) },
    description: conversation.meta.description || site.description,
    alternates: { canonical: '/' },
  }
}
