'use client'

import { useState } from 'react'
import { Embed } from '@/components/blocks/RenderProjectBlocks'
import { Picture } from '@/components/Media/Picture'
import type { MediaRef } from '@/data/types'

/**
 * Hero with a "watch the film" overlay. The third-party player is loaded only after
 * the visitor clicks, which keeps the page light and avoids third-party cookies until then.
 */
export function PlayOverlay({ image, video, url, title }: { image?: MediaRef; video?: MediaRef; url: string; title: string }) {
  const [playing, setPlaying] = useState(false)
  if (playing) return <Embed caption={`${title}, the film`} url={url} />
  return (
    <div className="case-hero has-play">
      {video ? <video autoPlay loop muted playsInline poster={image?.url} src={video.url} /> : image ? <Picture media={image} priority size="xlarge" sizes="(max-width: 960px) 100vw, 70vw" /> : <div className="case-hero-blank" />}
      <button className="play-overlay" onClick={() => setPlaying(true)} type="button">
        <span className="play-btn" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M8 5v14l11-7z" fill="currentColor" />
          </svg>
        </span>
        <span className="play-text">
          <span className="eyebrow">Watch the film</span>
          <span className="play-title">{title}, the film.</span>
          <span className="play-note">Loads the player from the video host, which sets a few cookies of its own.</span>
        </span>
      </button>
    </div>
  )
}
