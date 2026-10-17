'use client'

import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate'

type Progress = (message: string) => void
type MediaItem = { url: string; filename: string; alt?: string }

const today = () => new Date().toISOString().slice(0, 10)

function save(blob: Blob, name: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  window.setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

async function fetchSiteJson(): Promise<string> {
  const res = await fetch('/api/site-json', { credentials: 'include', cache: 'no-store' })
  if (!res.ok) throw new Error(`Export failed (${res.status}).`)
  return res.text()
}

/** site.json only: settings and content, with images as links. */
export async function downloadJson(progress: Progress = () => undefined) {
  progress('Exporting…')
  save(new Blob([await fetchSiteJson()], { type: 'application/json' }), `site-${today()}.json`)
  progress('')
}

/**
 * The full backup, built in the browser: site.json plus every file in the media library, in one .zip.
 * Importing it restores everything without needing the old storage.
 */
export async function downloadBackup(progress: Progress = () => undefined) {
  progress('Exporting content…')
  const text = await fetchSiteJson()
  const media = ((JSON.parse(text) as { media?: MediaItem[] }).media ?? []).filter((m) => m.url && m.filename)
  const files: Record<string, Uint8Array> = { 'site.json': strToU8(text) }
  const missing: string[] = []
  let done = 0
  // A few at a time: quick without flooding the connection.
  const queue = [...media]
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      for (let m = queue.shift(); m; m = queue.shift()) {
        try {
          const res = await fetch(m.url)
          if (!res.ok) throw new Error()
          files[`media/${m.filename}`] = new Uint8Array(await res.arrayBuffer())
        } catch {
          missing.push(m.filename)
        }
        done += 1
        progress(`Collecting images ${done}/${media.length}…`)
      }
    }),
  )
  if (missing.length) files['missing-images.txt'] = strToU8(`These images could not be downloaded; site.json still links to them:\n${missing.join('\n')}\n`)
  progress('Zipping…')
  // Images are already compressed; storing them is as small and much faster.
  const zip = zipSync(Object.fromEntries(Object.entries(files).map(([k, v]) => [k, [v, { level: k.endsWith('.json') || k.endsWith('.txt') ? 6 : 0 }]])) as never)
  save(new Blob([zip as BlobPart], { type: 'application/zip' }), `site-backup-${today()}.zip`)
  progress('')
  return { images: media.length - missing.length, missing }
}

export type LoadedBackup = { json: string; files: { name: string; data: Uint8Array }[] }

/** Reads a chosen .json or .zip backup. */
export async function readBackup(file: File): Promise<LoadedBackup> {
  if (!/\.zip$/i.test(file.name)) return { json: await file.text(), files: [] }
  const entries = unzipSync(new Uint8Array(await file.arrayBuffer()))
  const jsonEntry = entries['site.json'] ?? Object.entries(entries).find(([k]) => k.endsWith('site.json'))?.[1]
  if (!jsonEntry) throw new Error('This zip has no site.json inside.')
  const files = Object.entries(entries)
    .filter(([k, v]) => /(^|\/)media\/[^/]+$/.test(k) && v.length > 0)
    .map(([k, data]) => ({ name: k.split('/').pop()!, data }))
  return { json: strFromU8(jsonEntry), files }
}

const TYPES: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', avif: 'image/avif', svg: 'image/svg+xml', mp4: 'video/mp4', webm: 'video/webm', pdf: 'application/pdf' }

/**
 * Puts a backup's image files into the media library before the content is imported, skipping files
 * already there (same name). The import then finds every image by name instead of downloading it.
 */
export async function uploadBackupFiles(backup: LoadedBackup, progress: Progress = () => undefined): Promise<{ uploaded: number; skipped: number; failed: string[] }> {
  const alts = new Map(((JSON.parse(backup.json) as { media?: MediaItem[] }).media ?? []).map((m) => [m.filename, m.alt ?? '']))
  let uploaded = 0
  let skipped = 0
  const failed: string[] = []
  for (const [i, f] of backup.files.entries()) {
    progress(`Uploading images ${i + 1}/${backup.files.length}…`)
    const exists = await fetch(`/api/media?where[filename][equals]=${encodeURIComponent(f.name)}&limit=1&depth=0`, { credentials: 'include' })
      .then((r) => r.json() as Promise<{ totalDocs?: number }>)
      .catch(() => ({ totalDocs: 0 }))
    if (exists.totalDocs) {
      skipped += 1
      continue
    }
    const form = new FormData()
    const type = TYPES[f.name.split('.').pop()?.toLowerCase() ?? ''] ?? 'application/octet-stream'
    form.append('file', new Blob([f.data as BlobPart], { type }), f.name)
    form.append('_payload', JSON.stringify({ alt: alts.get(f.name) || f.name.replace(/\.[a-z0-9]+$/i, '') }))
    const res = await fetch('/api/media', { method: 'POST', credentials: 'include', body: form }).catch(() => null)
    if (res?.ok) uploaded += 1
    else failed.push(f.name)
  }
  progress('')
  return { uploaded, skipped, failed }
}
