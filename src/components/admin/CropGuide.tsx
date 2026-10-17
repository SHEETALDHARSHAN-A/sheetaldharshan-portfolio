'use client'

import { useFormFields } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

export type CropFrame = { label: string; ratio: number; color: string }

type Media = { id: number | string; url?: string; width?: number; height?: number; focalX?: number | null; focalY?: number | null }

const idOf = (v: unknown): string => (v && typeof v === 'object' ? String((v as { id?: unknown }).id ?? '') : v == null ? '' : String(v))

/** The part of a W×H image an `object-fit: cover` frame of this ratio shows, around the focal point (in %). */
function cut(w: number, h: number, ratio: number, fx: number, fy: number) {
  if (w / h > ratio) {
    const cw = h * ratio
    return { left: (((w - cw) * fx) / 100 / w) * 100, top: 0, width: (cw / w) * 100, height: 100 }
  }
  const ch = w / ratio
  return { left: 0, top: (((h - ch) * fy) / 100 / h) * 100, width: 100, height: (ch / h) * 100 }
}

/**
 * Under an image field: the photo with every shape the site cuts it to drawn on top, from the tallest
 * to the widest. Clicking the photo moves its focal point (saved on the image), and the cuts follow,
 * so you can see what will show before publishing, or pick a better photo.
 */
export function CropGuide({ watch, frames, note }: { watch: string; frames: CropFrame[]; note?: string }) {
  const id = useFormFields(([fields]) => idOf(fields[watch]?.value))
  const [media, setMedia] = useState<Media | null>(null)
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (!id) return
    let alive = true
    fetch(`/api/media/${encodeURIComponent(id)}?depth=0`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((doc: Media | null) => alive && doc && setMedia(doc))
      .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [id])

  const current = media && String(media.id) === id ? media : null
  if (!id || !current?.url || !current.width || !current.height) {
    return note ? <p style={{ margin: '-8px 0 24px', fontSize: 13, color: 'var(--theme-elevation-500)' }}>{note}</p> : null
  }
  const { width: w, height: h } = current
  const fx = current.focalX ?? 50
  const fy = current.focalY ?? 50
  const cuts = frames.map((f) => ({ ...f, box: cut(w, h, f.ratio, fx, fy) }))
  // What every shape keeps: put the face here.
  const safe = cuts.reduce(
    (a, { box }) => {
      const left = Math.max(a.left, box.left)
      const top = Math.max(a.top, box.top)
      return { left, top, right: Math.min(a.right, box.left + box.width), bottom: Math.min(a.bottom, box.top + box.height) }
    },
    { left: 0, top: 0, right: 100, bottom: 100 },
  )

  const setFocal = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const focalX = Math.round(((e.clientX - r.left) / r.width) * 100)
    const focalY = Math.round(((e.clientY - r.top) / r.height) * 100)
    setMedia({ ...current, focalX, focalY })
    setStatus('Saving…')
    fetch(`/api/media/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ focalX, focalY }),
    })
      .then((r) => setStatus(r.ok ? 'Focal point saved. The site shows it within 5 minutes.' : 'Could not save the focal point.'))
      .catch(() => setStatus('Could not save the focal point.'))
  }

  const small = w < 1200 || h < 1200
  return (
    <div style={{ margin: '-4px 0 28px', display: 'grid', gap: 10 }}>
      <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--theme-elevation-500)' }}>How the site cuts this photo</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-start' }}>
        <div
          onClick={setFocal}
          title="Click to set the focal point"
          style={{ position: 'relative', width: 'min(360px, 100%)', aspectRatio: `${w} / ${h}`, cursor: 'crosshair', borderRadius: 6, overflow: 'hidden', userSelect: 'none' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.url} alt="" draggable={false} style={{ width: '100%', height: '100%', display: 'block' }} />
          <span
            style={{
              position: 'absolute',
              left: `${safe.left}%`,
              top: `${safe.top}%`,
              width: `${Math.max(0, safe.right - safe.left)}%`,
              height: `${Math.max(0, safe.bottom - safe.top)}%`,
              boxShadow: '0 0 0 9999px rgba(0,0,0,.45)',
              pointerEvents: 'none',
            }}
          />
          {cuts.map((c) => (
            <span
              key={c.label}
              style={{ position: 'absolute', left: `${c.box.left}%`, top: `${c.box.top}%`, width: `${c.box.width}%`, height: `${c.box.height}%`, border: `2px solid ${c.color}`, pointerEvents: 'none', boxSizing: 'border-box' }}
            />
          ))}
          <span
            style={{ position: 'absolute', left: `${fx}%`, top: `${fy}%`, width: 14, height: 14, marginLeft: -7, marginTop: -7, borderRadius: '50%', border: '2px solid #fff', background: 'rgba(0,0,0,.35)', pointerEvents: 'none' }}
          />
        </div>
        <div style={{ display: 'grid', gap: 8, fontSize: 13, minWidth: 220, flex: 1 }}>
          {cuts.map((c) => (
            <span key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 14, height: 14, border: `2px solid ${c.color}`, borderRadius: 3, flex: 'none' }} />
              {c.label}
            </span>
          ))}
          <span style={{ color: 'var(--theme-elevation-600)' }}>
            The clear area is what every shape keeps: your face should sit inside it. Click the photo to move the focal point (the ring).
          </span>
          <span style={{ color: small ? 'var(--theme-warning-500, #d9a400)' : 'var(--theme-elevation-500)' }}>
            This photo: {w}×{h} px{small ? '. A larger photo (at least 1200×1500) will look sharper.' : '.'}
          </span>
          {note ? <span style={{ color: 'var(--theme-elevation-500)' }}>{note}</span> : null}
          {status ? <span style={{ color: 'var(--theme-success-500)' }}>{status}</span> : null}
        </div>
      </div>
    </div>
  )
}
