'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import type { MediaRef } from '@/data/types'

/**
 * Project hero that cycles through several images (the main image plus the project's image loop),
 * cross-fading every few seconds and back to the start. Pauses in hidden tabs and for reduced motion.
 */
export function HeroLoop({ images, title, seconds }: { images: MediaRef[]; title: string; seconds: number }) {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    if (images.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = window.setInterval(() => {
      if (document.visibilityState === 'visible') setIndex((i) => (i + 1) % images.length)
    }, seconds * 1000)
    return () => window.clearInterval(t)
  }, [images.length, seconds])

  return (
    <div className="case-hero hero-loop" aria-roledescription="carousel" aria-label={`${title} images`}>
      {images.map((m, i) => {
        const src = m.sizes?.xlarge ?? m
        return (
          <Image
            key={m.url}
            className={i === index ? 'is-on' : ''}
            alt={i === index ? m.alt || title : ''}
            aria-hidden={i !== index}
            src={src.url}
            width={src.width ?? m.width ?? 1920}
            height={src.height ?? m.height ?? 1200}
            sizes="(max-width: 960px) 100vw, 70vw"
            quality={85}
            priority={i === 0}
          />
        )
      })}
      {images.length > 1 ? (
        <span className="hero-dots" aria-hidden="true">
          {images.map((m, i) => (
            <i key={m.url} data-on={i === index} />
          ))}
        </span>
      ) : null}
    </div>
  )
}
