import type { Media } from '@/payload-types'
import type { MediaRef } from '@/data/types'

const sizeKeys = ['thumbnail', 'square', 'small', 'medium', 'large', 'xlarge', 'og'] as const

/** Convert a populated Payload media relation into the frontend MediaRef. Unpopulated ids return undefined. */
export function toMediaRef(input: unknown): MediaRef | undefined {
  if (!input || typeof input !== 'object') return undefined
  const media = input as Media
  if (!media.url) return undefined
  const sizes: MediaRef['sizes'] = {}
  for (const key of sizeKeys) {
    const size = media.sizes?.[key]
    if (size?.url) sizes[key] = { url: size.url, width: size.width ?? undefined, height: size.height ?? undefined }
  }
  return {
    url: media.url,
    alt: media.alt ?? '',
    width: media.width ?? undefined,
    height: media.height ?? undefined,
    mimeType: media.mimeType ?? undefined,
    sizes,
  }
}
