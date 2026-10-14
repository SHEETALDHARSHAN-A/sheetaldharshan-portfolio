'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { MediaRef } from '@/data/types'

/**
 * Project hero: a tiny blurred preview (the 300 px thumbnail, a few KB, straight from the CDN)
 * shows immediately; the sharp image fades in over it once it has loaded.
 */
export function HeroImage({ media, title }: { media: MediaRef; title: string }) {
  const [ready, setReady] = useState(false)
  const ref = useRef<HTMLImageElement>(null)
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth > 0) setReady(true)
  }, [])
  const preview = media.sizes?.thumbnail?.url ?? media.sizes?.small?.url
  const src = media.sizes?.xlarge?.url ?? media.url
  return (
    <div className="case-hero hero-progressive" style={preview ? { backgroundImage: `url(${preview})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' } : undefined}>
      <Image
        ref={ref}
        alt={media.alt || title}
        className={ready ? 'is-ready' : ''}
        fetchPriority="high"
        height={media.sizes?.xlarge?.height ?? media.height ?? 1200}
        onLoad={() => setReady(true)}
        priority
        quality={85}
        sizes="(max-width: 960px) 100vw, 70vw"
        src={src}
        width={media.sizes?.xlarge?.width ?? media.width ?? 1920}
      />
    </div>
  )
}
