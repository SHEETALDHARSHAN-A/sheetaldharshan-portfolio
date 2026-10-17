'use client'

import { useFormFields } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

export type CurrentImageItem = {
  label: string
  /** The upload field this preview follows. */
  watch: string
  /** Fields used instead when `watch` is empty, in order (the dark favicon falls back to the light one). */
  chain?: string[]
  /** The built-in image used when every field is empty; none means nothing is shown on the site. */
  fallback?: string
  fallbackLabel: string
  /** A sprite sheet: show only its first frame. */
  sprite?: boolean
}

type Media = { url?: string; filename?: string; mimeType?: string }

const idOf = (v: unknown): string => (v && typeof v === 'object' ? String((v as { id?: unknown }).id ?? '') : v == null ? '' : String(v))

function useMedia(id: string): Media | null {
  const [media, setMedia] = useState<{ id: string; doc: Media } | null>(null)
  useEffect(() => {
    if (!id) return
    let alive = true
    fetch(`/api/media/${encodeURIComponent(id)}?depth=0`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((doc: Media | null) => alive && doc && setMedia({ id, doc }))
      .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [id])
  return id && media?.id === id ? media.doc : null
}

function Preview({ item, ids }: { item: CurrentImageItem; ids: string[] }) {
  const index = ids.findIndex(Boolean)
  const media = useMedia(index >= 0 ? ids[index] : '')
  const uploaded = index >= 0
  const src = uploaded ? media?.url : item.fallback
  const source = !uploaded ? item.fallbackLabel : index === 0 ? `Your upload${media?.filename ? `: ${media.filename}` : ''}` : `Same as “${(item.chain ?? [])[index - 1]}” above`
  const isPdf = media?.mimeType === 'application/pdf'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
      <div
        style={{
          width: 64,
          height: 64,
          flex: 'none',
          borderRadius: 8,
          border: '1px solid var(--theme-elevation-150)',
          // A checkerboard, so transparent images and light or dark logos are all visible.
          background: 'repeating-conic-gradient(var(--theme-elevation-100) 0 25%, var(--theme-elevation-50) 0 50%) 0 0 / 12px 12px',
          display: 'grid',
          placeItems: 'center',
          overflow: 'hidden',
        }}
      >
        {src && !isPdf ? (
          item.sprite ? (
            <span style={{ width: 59, height: 64, backgroundImage: `url(${src})`, backgroundSize: '800% 1100%', backgroundPosition: '0 0', backgroundRepeat: 'no-repeat' }} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          )
        ) : (
          <span style={{ fontSize: 11, color: 'var(--theme-elevation-500)' }}>{isPdf ? 'PDF' : uploaded ? '…' : 'None'}</span>
        )}
      </div>
      <div style={{ display: 'grid', gap: 2, minWidth: 0, fontSize: 13 }}>
        <strong style={{ fontWeight: 600 }}>{item.label}</strong>
        <span style={{ color: uploaded ? 'var(--theme-success-500)' : 'var(--theme-elevation-600)', overflowWrap: 'anywhere' }}>{source}</span>
        {uploaded && item.fallback ? <span style={{ color: 'var(--theme-elevation-500)', fontSize: 12 }}>Remove the upload to go back to the built-in one.</span> : null}
      </div>
    </div>
  )
}

/** "In use now" under upload fields: what the site shows today, whether your upload or the built-in default. */
export function CurrentImages({ items }: { items: CurrentImageItem[] }) {
  const names = [...new Set(items.flatMap((i) => [i.watch, ...(i.chain ?? [])]))]
  const joined = useFormFields(([fields]) => names.map((n) => idOf(fields[n]?.value)).join('|'))
  const values = Object.fromEntries(joined.split('|').map((v, i) => [names[i], v]))
  return (
    <div style={{ margin: '4px 0 28px', padding: 14, borderRadius: 8, border: '1px dashed var(--theme-elevation-200)', display: 'grid', gap: 10 }}>
      <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--theme-elevation-500)' }}>In use now</span>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(220px, 1fr))`, gap: 16 }}>
        {items.map((item) => (
          <Preview key={item.label} item={item} ids={[item.watch, ...(item.chain ?? [])].map((n) => values[n] ?? '')} />
        ))}
      </div>
    </div>
  )
}
