import React from 'react'
import RichText from '@/components/RichText'
import { MediaAny, Picture } from '@/components/Media/Picture'
import { CodeBlock } from '@/blocks/Code/Component'
import { videoSource } from '@/utilities/videoSource'
import { toMediaRef } from '@/data/media'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

type AnyBlock = { blockType: string; id?: string | null } & Record<string, unknown>

/** `autoplay` is for players opened by a click (the "Watch the film" overlay), so one click is enough. */
export function Embed({ url, caption, autoplay = false }: { url: string; caption?: string | null; autoplay?: boolean }) {
  const source = videoSource(url, autoplay)
  if (source?.kind !== 'embed') return null
  const src = source.src
  return (
    <figure className="media-figure">
      <div className="embed">
        <iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" src={src} title={caption ?? 'Embedded video'} />
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

/** Renders the whitelisted block types used by project pages and CMS pages. Unknown types are skipped. */
export function RenderProjectBlocks({ blocks }: { blocks: unknown[] }) {
  if (!Array.isArray(blocks) || blocks.length === 0) return null
  return (
    <>
      {(blocks as AnyBlock[]).map((block, index) => {
        const key = block.id ?? `${block.blockType}-${index}`
        switch (block.blockType) {
          case 'prose':
            return (
              <section className="case-section" key={key}>
                {typeof block.heading === 'string' && block.heading && <h2>{block.heading}</h2>}
                <RichText className="prose" data={block.richText as DefaultTypedEditorState} enableGutter={false} enableProse={false} />
              </section>
            )
          case 'mediaBlock': {
            const media = toMediaRef(block.media)
            if (!media) return null
            return (
              <figure className="media-figure" key={key}>
                <MediaAny media={media} sizes="(max-width: 960px) 100vw, 70vw" />
              </figure>
            )
          }
          case 'gallery': {
            const items = (block.items as { media: unknown; caption?: string | null }[] | undefined) ?? []
            return (
              <section className="case-section" key={key}>
                {typeof block.heading === 'string' && block.heading && <h2>{block.heading}</h2>}
                <div className={`gallery ${block.layout === 'two' ? 'two' : block.layout === 'three' ? 'three' : ''}`}>
                  {items.map((item, i) => {
                    const media = toMediaRef(item.media)
                    if (!media) return null
                    return (
                      <figure className="media-figure" key={i}>
                        <MediaAny media={media} sizes="(max-width: 960px) 100vw, 40vw" />
                        {item.caption && <figcaption>{item.caption}</figcaption>}
                      </figure>
                    )
                  })}
                </div>
              </section>
            )
          }
          case 'code':
            return <CodeBlock blockType="code" className="code-block" code={String(block.code ?? '')} language={typeof block.language === 'string' ? block.language : undefined} key={key} />
          case 'features': {
            const items = (block.items as { title: string; text?: string | null }[] | undefined) ?? []
            return (
              <section className="case-section" key={key}>
                <h2>{typeof block.heading === 'string' && block.heading ? block.heading : 'What it does'}</h2>
                <ul className="feature-list">
                  {items.map((item, i) => (
                    <li key={i}>
                      <strong>{item.title}</strong>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )
          }
          case 'timeline': {
            const items = (block.items as { when: string; title: string; text?: string | null }[] | undefined) ?? []
            return (
              <section className="case-section" key={key}>
                <h2>{typeof block.heading === 'string' && block.heading ? block.heading : 'Timeline'}</h2>
                <ol className="timeline">
                  {items.map((item, i) => (
                    <li key={i}>
                      <span className="when">{item.when}</span>
                      <div>
                        <strong>{item.title}</strong>
                        {item.text && <p>{item.text}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )
          }
          case 'links': {
            const items = (block.items as { label: string; href: string; note?: string | null }[] | undefined) ?? []
            return (
              <section className="case-section" key={key}>
                <h2>{typeof block.heading === 'string' && block.heading ? block.heading : 'Links'}</h2>
                <ul className="link-list">
                  {items.map((item, i) => (
                    <li key={i}>
                      <a href={item.href} rel="noreferrer" target={item.href.startsWith('/') ? undefined : '_blank'}>
                        {item.label}
                      </a>
                      {item.note && <small>{item.note}</small>}
                    </li>
                  ))}
                </ul>
              </section>
            )
          }
          case 'stats': {
            const items = (block.items as { value: string; label: string }[] | undefined) ?? []
            return (
              <section className="case-section" key={key}>
                <h2>{typeof block.heading === 'string' && block.heading ? block.heading : 'Facts'}</h2>
                <div className="stats">
                  {items.map((item, i) => (
                    <div className="stat" key={i}>
                      <div className="v">{item.value}</div>
                      <div className="l">{item.label}</div>
                    </div>
                  ))}
                </div>
              </section>
            )
          }
          case 'embed':
            return <Embed caption={block.caption as string | null} key={key} url={String(block.url ?? '')} />
          case 'content':
          case 'cta':
          case 'archive':
          case 'formBlock':
            return null
          default:
            return null
        }
      })}
    </>
  )
}

export function HeroMedia({ image, video, title }: { image?: { url: string; alt: string; width?: number; height?: number; sizes?: never } | null; video?: { url: string } | null; title: string }) {
  if (video) {
    return (
      <div className="case-hero">
        <video autoPlay loop muted playsInline poster={image?.url} src={video.url} />
      </div>
    )
  }
  if (image) {
    return (
      <div className="case-hero">
        <Picture media={{ ...image, alt: image.alt || title }} priority size="xlarge" sizes="(max-width: 960px) 100vw, 70vw" />
      </div>
    )
  }
  return null
}
