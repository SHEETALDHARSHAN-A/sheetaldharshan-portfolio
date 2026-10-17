'use client'

import { useForm, useFormFields } from '@payloadcms/ui'
import { useEffect, useRef, useState } from 'react'

export type CropFrame = { label: string; short: string; ratio: number; color: string }

type Media = { id: number | string; url?: string; width?: number; height?: number; focalX?: number | null; focalY?: number | null }
type Box = { left: number; top: number; width: number; height: number }

const idOf = (v: unknown): string => (v && typeof v === 'object' ? String((v as { id?: unknown }).id ?? '') : v == null ? '' : String(v))
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined)

/** The part of a W×H image an `object-fit: cover` frame of this ratio shows, around the focal point (all in %). */
function cut(w: number, h: number, ratio: number, fx: number, fy: number): Box {
  if (w / h > ratio) {
    const cw = h * ratio
    return { left: (((w - cw) * fx) / 100 / w) * 100, top: 0, width: (cw / w) * 100, height: 100 }
  }
  const ch = w / ratio
  return { left: 0, top: (((h - ch) * fy) / 100 / h) * 100, width: 100, height: (ch / h) * 100 }
}

function intersect(boxes: Box[]): Box {
  const l = Math.max(...boxes.map((b) => b.left))
  const t = Math.max(...boxes.map((b) => b.top))
  const r = Math.min(...boxes.map((b) => b.left + b.width))
  const btm = Math.min(...boxes.map((b) => b.top + b.height))
  return { left: l, top: t, width: Math.max(0, r - l), height: Math.max(0, btm - t) }
}

const pct = (b: Box) => ({ left: `${b.left}%`, top: `${b.top}%`, width: `${b.width}%`, height: `${b.height}%` })

/**
 * Under an image field: the photo as the site will cut it. Pick a shape and the parts it cuts off fade
 * to ghosts; "All" keeps only what every shape shows. Click or drag on the photo to move the focal point
 * (the ring); it is saved with this page (Save / Publish), and small previews show each final cut.
 */
export function CropGuide({ watch, focalX, focalY, frames, note }: { watch: string; focalX: string; focalY: string; frames: CropFrame[]; note?: string }) {
  const id = useFormFields(([fields]) => idOf(fields[watch]?.value))
  const formFx = useFormFields(([fields]) => num(fields[focalX]?.value))
  const formFy = useFormFields(([fields]) => num(fields[focalY]?.value))
  const { dispatchFields, setModified } = useForm()
  const [media, setMedia] = useState<Media | null>(null)
  const [shape, setShape] = useState<number | 'all'>('all')
  const dragging = useRef(false)

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
  const { width: w, height: h, url } = current
  const fx = formFx ?? current.focalX ?? 50
  const fy = formFy ?? current.focalY ?? 50
  const cuts = frames.map((f) => ({ ...f, box: cut(w, h, f.ratio, fx, fy) }))
  const shown = shape === 'all' ? intersect(cuts.map((c) => c.box)) : cuts[shape].box

  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const clamp = (v: number) => Math.round(Math.max(0, Math.min(100, v)))
    dispatchFields({ type: 'UPDATE', path: focalX, value: clamp(((e.clientX - r.left) / r.width) * 100) })
    dispatchFields({ type: 'UPDATE', path: focalY, value: clamp(((e.clientY - r.top) / r.height) * 100) })
    setModified(true)
  }

  const small = w < 1200 || h < 1200
  const tab = (active: boolean): React.CSSProperties => ({
    padding: '4px 10px',
    borderRadius: 999,
    border: `1px solid ${active ? 'var(--theme-elevation-800)' : 'var(--theme-elevation-150)'}`,
    background: active ? 'var(--theme-elevation-800)' : 'transparent',
    color: active ? 'var(--theme-elevation-0)' : 'var(--theme-elevation-700)',
    font: 'inherit',
    fontSize: 12,
    cursor: 'pointer',
  })

  return (
    <div style={{ margin: '-4px 0 28px', display: 'grid', gap: 12 }}>
      <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--theme-elevation-500)' }}>How the site cuts this photo</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <button type="button" style={tab(shape === 'all')} onClick={() => setShape('all')}>
          All shapes
        </button>
        {cuts.map((c, i) => (
          <button key={c.label} type="button" style={tab(shape === i)} onClick={() => setShape(i)} title={c.label}>
            {c.short}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-start' }}>
        <div
          onPointerDown={(e) => {
            dragging.current = true
            e.currentTarget.setPointerCapture(e.pointerId)
            move(e)
          }}
          onPointerMove={(e) => dragging.current && move(e)}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
          title="Click or drag to set the focal point"
          style={{ position: 'relative', width: 'min(380px, 100%)', aspectRatio: `${w} / ${h}`, cursor: 'crosshair', borderRadius: 6, overflow: 'hidden', userSelect: 'none', touchAction: 'none' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" draggable={false} style={{ width: '100%', height: '100%', display: 'block' }} />
          {/* Ghost sides: everything outside the chosen cut fades back. */}
          <span
            style={{
              position: 'absolute',
              ...pct(shown),
              boxShadow: '0 0 0 9999px color-mix(in srgb, var(--theme-bg) 72%, transparent)',
              outline: '1px solid rgba(255,255,255,.85)',
              transition: 'all 180ms ease',
              pointerEvents: 'none',
            }}
          />
          {shape === 'all'
            ? cuts.map((c) => <span key={c.label} style={{ position: 'absolute', ...pct(c.box), border: `2px solid ${c.color}`, boxSizing: 'border-box', pointerEvents: 'none' }} />)
            : null}
          <span
            style={{ position: 'absolute', left: `${fx}%`, top: `${fy}%`, width: 16, height: 16, marginLeft: -8, marginTop: -8, borderRadius: '50%', border: '2px solid #fff', background: 'rgba(0,0,0,.35)', boxShadow: '0 1px 4px rgba(0,0,0,.5)', pointerEvents: 'none' }}
          />
        </div>
        <div style={{ display: 'grid', gap: 12, minWidth: 220, flex: 1 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            {cuts.map((c, i) => (
              <button
                key={c.label}
                type="button"
                onClick={() => setShape(i)}
                title={c.label}
                style={{ display: 'grid', gap: 4, padding: 0, border: 0, background: 'none', cursor: 'pointer', color: 'var(--theme-elevation-600)', font: 'inherit', fontSize: 11 }}
              >
                <span style={{ height: 96, aspectRatio: String(c.ratio), borderRadius: 6, overflow: 'hidden', outline: `2px solid ${shape === i ? c.color : 'transparent'}`, outlineOffset: 2 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${fx}% ${fy}%`, display: 'block' }} />
                </span>
                {c.short}
              </button>
            ))}
          </div>
          <span style={{ fontSize: 13, color: 'var(--theme-elevation-600)' }}>
            {shape === 'all' ? 'The clear area is what every shape keeps: your face should sit inside it.' : frames[shape].label}. Click or drag on the photo to move the focal point (the ring), then Save.
          </span>
          <span style={{ fontSize: 13, color: small ? 'var(--theme-warning-500, #d9a400)' : 'var(--theme-elevation-500)' }}>
            This photo: {w}×{h} px{small ? '. A larger photo (at least 1200×1500) will look sharper.' : '.'}
          </span>
          {note ? <span style={{ fontSize: 13, color: 'var(--theme-elevation-500)' }}>{note}</span> : null}
        </div>
      </div>
    </div>
  )
}
