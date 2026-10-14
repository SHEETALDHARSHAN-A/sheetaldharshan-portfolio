import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import RichText from '@/components/RichText'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderProjectBlocks } from '@/components/blocks/RenderProjectBlocks'
import { PageFrame } from '@/components/shell/PageFrame'
import { getPage } from '@/data/content'
import { isReservedSlug } from '@/utilities/reservedSlugs'

type Props = { params: Promise<{ slug: string }> }

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  if (isReservedSlug(slug)) return {}
  const page = await getPage(slug)
  if (!page) return { title: 'Page not found' }
  return { title: page.meta?.title || page.title, description: page.meta?.description || undefined, alternates: { canonical: `/${page.slug}` } }
}

/** CMS-managed pages. Reserved application paths are never served from here. */
export default async function CmsPage({ params }: Props) {
  const { slug } = await params
  if (isReservedSlug(slug)) notFound()
  const [page, { isEnabled: draft }] = await Promise.all([getPage(slug), draftMode()])
  if (!page) notFound()

  const ownBlocks = (page.layout ?? []).filter((block) => ['prose', 'mediaBlock', 'gallery', 'code', 'features', 'links', 'timeline', 'embed'].includes(block.blockType))
  const templateBlocks = (page.layout ?? []).filter((block) => !['prose', 'mediaBlock', 'gallery', 'code', 'features', 'links', 'timeline', 'embed'].includes(block.blockType))

  return (
    <PageFrame>
    <div className="page page-narrow">
      {draft && <LivePreviewListener />}
      <header className="page-head">
        <h1>{page.title}</h1>
        {page.hero?.richText && <RichText className="prose" data={page.hero.richText as DefaultTypedEditorState} enableGutter={false} enableProse={false} />}
      </header>
      <div className="case-body" style={{ padding: 0 }}>
        <RenderProjectBlocks blocks={ownBlocks} />
        {templateBlocks.length > 0 && <RenderBlocks blocks={templateBlocks as never} />}
      </div>
    </div>
    </PageFrame>
  )
}
