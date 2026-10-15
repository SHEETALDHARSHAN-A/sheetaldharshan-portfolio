'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { MediaRef } from '@/data/types'

/**
 * The About portrait loads in three steps instead of popping in: a soft shimmer, then the tiny
 * thumbnail blurred (a few KB, usually instant), then the sharp photo fading and settling in.
 */
export function AboutPhoto({ media }: { media: MediaRef }) {
  const [preview, setPreview] = useState(false)
  const [ready, setReady] = useState(false)
  const sharp = useRef<HTMLImageElement>(null)
  const thumb = useRef<HTMLImageElement>(null)
  useEffect(() => {
    // Cached images can finish before hydration, so their load events are missed.
    if (thumb.current?.complete && thumb.current.naturalWidth > 0) setPreview(true)
    if (sharp.current?.complete && sharp.current.naturalWidth > 0) setReady(true)
  }, [])
  const small = media.sizes?.thumbnail?.url ?? media.sizes?.small?.url
  const large = media.sizes?.large ?? media.sizes?.medium
  return (
    <div className="photo-progressive" data-preview={preview ? 'true' : 'false'} data-ready={ready ? 'true' : 'false'}>
      <span className="photo-shimmer" aria-hidden="true" />
      {small ? (
        // eslint-disable-next-line @next/next/no-img-element -- the tiny preview is used as-is, blurred
        <img ref={thumb} className="photo-preview" src={small} alt="" aria-hidden="true" decoding="async" onLoad={() => setPreview(true)} />
      ) : null}
      <Image
        ref={sharp}
        className="photo-sharp"
        alt={media.alt}
        src={large?.url ?? media.url}
        width={large?.width ?? media.width ?? 800}
        height={large?.height ?? media.height ?? 800}
        sizes="(max-width: 960px) 340px, 40vw"
        quality={85}
        priority
        fetchPriority="high"
        onLoad={() => setReady(true)}
      />
    </div>
  )
}
