import Image from 'next/image'
import type { MediaRef } from '@/data/types'

type Size = (NonNullable<MediaRef['sizes']> extends Partial<Record<infer K, unknown>> ? K : never) | 'original'

/**
 * Renders a Payload image through next/image. Picks the closest generated size when
 * available, and always carries the alt text from the Media document.
 */
export function Picture({
  media,
  size = 'large',
  sizes = '100vw',
  priority = false,
  className,
  unoptimized = false,
}: {
  media: MediaRef
  size?: Size
  sizes?: string
  priority?: boolean
  className?: string
  unoptimized?: boolean
}) {
  const chosen = size === 'original' ? undefined : media.sizes?.[size]
  const src = chosen?.url ?? media.url
  const width = chosen?.width ?? media.width ?? 1600
  const height = chosen?.height ?? media.height ?? 1000
  return <Image alt={media.alt} className={className} height={height} priority={priority} quality={100} sizes={sizes} src={src} unoptimized={unoptimized || size === 'original'} width={width} />
}

export function MediaAny({ media, className, sizes }: { media: MediaRef; className?: string; sizes?: string }) {
  if (media.mimeType?.startsWith('video')) {
    return <video className={className} controls playsInline preload="metadata" src={media.url} />
  }
  return <Picture className={className} media={media} sizes={sizes} />
}
