'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Play, X } from 'lucide-react'
import { Picture } from '@/components/Media/Picture'
import type { MediaRef } from '@/data/types'
import { videoSource } from '@/utilities/videoSource'

/**
 * A thumbnail with a play button; clicking opens the film in a dialog over a blurred page.
 * Nothing from the video host loads until then. A YouTube or Vimeo link plays in their player;
 * a direct MP4 link streams in the browser's own player, fetching only what is watched.
 */
export function VideoDialog({ url, title, image, duration }: { url: string; title: string; image?: MediaRef; duration?: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const source = videoSource(url, true)

  const show = () => {
    setOpen(true)
    setClosing(false)
    dialogRef.current?.showModal()
    document.documentElement.dataset.dialog = 'open'
  }

  const close = useCallback(() => {
    const dialog = dialogRef.current
    if (!dialog?.open) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const finish = () => {
      dialog.close()
      setOpen(false)
      setClosing(false)
      delete document.documentElement.dataset.dialog
    }
    if (reduced) return finish()
    setClosing(true)
    window.setTimeout(finish, 220)
  }, [])

  useEffect(() => () => void delete document.documentElement.dataset.dialog, [])

  if (!source) return null

  return (
    <div className="video-dialog">
      <button type="button" className="vd-thumb" onClick={show} aria-haspopup="dialog" aria-label={`Play ${title}, the film${duration ? ` (${duration})` : ''}`}>
        {image ? <Picture media={image} priority size="xlarge" sizes="(max-width: 960px) 100vw, 70vw" /> : <span className="vd-blank" />}
        <span className="vd-play" aria-hidden="true">
          <span className="vd-play-core">
            <Play size={30} fill="currentColor" strokeWidth={0} />
          </span>
        </span>
        <span className="vd-label" aria-hidden="true">
          Watch the film{duration ? <span>{duration}</span> : null}
        </span>
      </button>

      <dialog
        ref={dialogRef}
        className="vd-dialog"
        data-closing={closing ? 'true' : 'false'}
        aria-label={`${title}, the film`}
        onCancel={(e) => {
          e.preventDefault()
          close()
        }}
        onClick={(e) => {
          // A click on the dimmed area (the dialog itself, not the player) closes it.
          if (e.target === e.currentTarget) close()
        }}
      >
        <div className="vd-panel">
          <button type="button" className="vd-close" onClick={close} aria-label="Close video">
            <X size={20} />
          </button>
          <div className="vd-frame">
            {open ? (
              source.kind === 'embed' ? (
                <iframe
                  src={source.src}
                  title={`${title}, the film`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : (
                <video src={source.src} poster={image?.url} controls autoPlay playsInline preload="metadata" />
              )
            ) : null}
          </div>
        </div>
      </dialog>
    </div>
  )
}
