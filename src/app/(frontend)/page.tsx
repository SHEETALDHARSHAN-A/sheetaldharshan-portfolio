import type { Metadata } from 'next'
import { getImageProps } from 'next/image'
import { draftMode } from 'next/headers'
import { Conversation } from '@/components/home/Conversation'
import { HomeGate } from '@/components/home/HomeGate'
import { SiteWarmup, type WarmImage } from '@/components/home/SiteWarmup'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { JsonLd } from '@/components/seo/JsonLd'
import { PageFrame } from '@/components/shell/PageFrame'
import { getAbout, getEducation, getExperience, getHomepage, getProjects, getSite } from '@/data/content'
import type { MediaRef } from '@/data/types'
import { defaultTitle, personSchema, websiteSchema } from '@/data/seo'

export const revalidate = 300

/** The exact image request a page makes for this media (same as components/Media/Picture). */
function warm(media: MediaRef | undefined, size: 'original' | 'small' | 'large', sizes: string): WarmImage | null {
  if (!media || media.mimeType?.startsWith('video')) return null
  const chosen = size === 'original' ? undefined : (media.sizes?.[size] ?? (size === 'large' ? media.sizes?.medium : undefined))
  const { props } = getImageProps({ alt: '', src: chosen?.url ?? media.url, width: chosen?.width ?? media.width ?? 1600, height: chosen?.height ?? media.height ?? 1000, quality: 85, sizes })
  return { src: props.src, srcSet: props.srcSet, sizes: props.sizes }
}

export default async function HomePage() {
  const [conversation, site, about, experience, education, projects, { isEnabled: draft }] = await Promise.all([getHomepage(), getSite(), getAbout(), getExperience(), getEducation(), getProjects(), draftMode()])
  // What the menu's pages show first (Projects: the stage and its list; About: the photo), warmed while the conversation plays.
  const warmImages = [
    warm(projects[0]?.heroImage, 'original', '(max-width: 960px) 100vw, 85vw'),
    ...projects.map((p) => warm(p.thumbnail ?? p.heroImage, 'small', '(max-width: 960px) 100vw, 120px')),
    warm(about.photo, 'large', '(max-width: 960px) 340px, 40vw'),
    ...projects.slice(1, 3).map((p) => warm(p.heroImage, 'original', '(max-width: 960px) 100vw, 85vw')),
  ].filter((w): w is WarmImage => Boolean(w))
  const warmRoutes = [...new Set([...site.nav.map((n) => n.href).filter((h) => h.startsWith('/') && h !== '/'), ...projects.slice(0, 3).map((p) => `/projects/${p.slug}`)])]
  return (
    <PageFrame>
    <main
      className="jg"
      id="main"
      style={
        {
          ...(conversation.look.pageBackground ? { '--jg-bg0': conversation.look.pageBackground } : {}),
          ...(conversation.look.bubbleColor ? { '--jg-bg1': conversation.look.bubbleColor } : {}),
          ...(conversation.look.textColor ? { '--jg-fg0': conversation.look.textColor } : {}),
          ...(conversation.look.linkColor ? { '--jg-a0': conversation.look.linkColor } : {}),
        } as React.CSSProperties
      }
    >
      {draft && <LivePreviewListener />}
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': [websiteSchema(site), personSchema(site, { photo: about.photo, about, experience, education })] }} />
      <h1 className="sr-only">{site.fullName}</h1>
      <HomeGate />
      <Conversation data={conversation} />
      <SiteWarmup routes={warmRoutes} images={warmImages} />
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
