'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'
import { Picture } from '@/components/Media/Picture'
import type { MediaRef } from '@/data/types'
import { videoSource } from '@/utilities/videoSource'

/**
 * The project film, played in place: the thumbnail with a frosted play button, and on click the
 * film fades in in the same frame. Nothing from the video host loads before that click. A YouTube
 * or Vimeo link plays in their player; a direct MP4 link streams in the browser's own player.
 */
export function VideoPlayer({ url, title, image, duration }: { url: string; title: string; image?: MediaRef; duration?: string }) {
  const [playing, setPlaying] = useState(false)
  const source = videoSource(url, true)
  if (!source) return null

  return (
    <div className="video-player" data-playing={playing ? 'true' : 'false'}>
      {playing ? (
        <div className="vp-media">
          {source.kind === 'embed' ? (
            <iframe
              src={source.src}
              title={`${title}, the film`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <video src={source.src} poster={image?.url} controls autoPlay playsInline preload="metadata" />
          )}
        </div>
      ) : null}
      <button
        type="button"
        className="vp-thumb"
        onClick={() => setPlaying(true)}
        aria-label={`Play ${title}, the film${duration ? ` (${duration})` : ''}`}
        tabIndex={playing ? -1 : 0}
        aria-hidden={playing}
      >
        {image ? <Picture media={image} priority size="xlarge" sizes="(max-width: 960px) 100vw, 70vw" /> : <span className="vp-blank" />}
        <span className="vp-play" aria-hidden="true">
          <span className="vp-play-core">
            <Play size={30} fill="currentColor" strokeWidth={0} />
          </span>
        </span>
        <span className="vp-label" aria-hidden="true">
          Watch the film{duration ? <span>{duration}</span> : null}
        </span>
      </button>
    </div>
  )
}
