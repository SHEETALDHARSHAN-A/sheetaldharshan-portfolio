'use client'

import { useState } from 'react'
import type { ImportReport } from '@/utilities/siteData'
import { downloadBackup, downloadJson, readBackup, uploadBackupFiles, type LoadedBackup } from './siteBackup'

const card: React.CSSProperties = { padding: 20, borderRadius: 'var(--style-radius-m, 8px)', border: '1px solid var(--theme-elevation-150)', display: 'grid', gap: 12 }
const button = (primary = false): React.CSSProperties => ({
  justifySelf: 'start',
  padding: '8px 16px',
  borderRadius: 'var(--style-radius-m, 6px)',
  border: '1px solid var(--theme-elevation-250)',
  background: primary ? 'var(--theme-elevation-800)' : 'transparent',
  color: primary ? 'var(--theme-elevation-0)' : 'var(--theme-text)',
  font: 'inherit',
  fontSize: 14,
  cursor: 'pointer',
})
const muted: React.CSSProperties = { margin: 0, fontSize: 14, color: 'var(--theme-elevation-600)', lineHeight: 1.5 }

function List({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null
  return (
    <details>
      <summary style={{ cursor: 'pointer', fontSize: 14 }}>
        {title} ({items.length})
      </summary>
      <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 13, color: 'var(--theme-elevation-700)' }}>
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </details>
  )
}

/** Download the site as JSON, copy the AI prompt, and import a file with a preview first. */
export function SiteDataPanel({ prompt }: { prompt: string }) {
  const [text, setText] = useState('')
  const [fileName, setFileName] = useState('')
  const [preview, setPreview] = useState<ImportReport | null>(null)
  const [done, setDone] = useState<ImportReport | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<'' | 'preview' | 'import' | 'export'>('')
  const [copied, setCopied] = useState(false)
  const [progress, setProgress] = useState('')
  const [files, setFiles] = useState<LoadedBackup['files']>([])
  const [uploadNote, setUploadNote] = useState('')

  const exportWith = async (run: (p: (m: string) => void) => Promise<unknown>) => {
    setBusy('export')
    setError('')
    try {
      await run(setProgress)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy('')
      setProgress('')
    }
  }

  const send = async (dryRun: boolean) => {
    setError('')
    setDone(null)
    try {
      JSON.parse(text)
    } catch {
      setError('That is not valid JSON. Check the file, or ask the AI to reply with the JSON only.')
      return
    }
    setBusy(dryRun ? 'preview' : 'import')
    try {
      // A full backup brings its image files: put them in the media library first.
      if (!dryRun && files.length) {
        const up = await uploadBackupFiles({ json: text, files }, setProgress)
        setUploadNote(`Images from the backup: ${up.uploaded} added, ${up.skipped} already there${up.failed.length ? `, ${up.failed.length} failed (${up.failed.join(', ')})` : ''}.`)
      }
      setProgress(dryRun ? '' : 'Importing content…')
      const res = await fetch(`/api/site-json${dryRun ? '?dryRun=1' : ''}`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: text })
      const body = (await res.json()) as ImportReport & { error?: string }
      if (!res.ok) throw new Error(body.error || `Import failed (${res.status}).`)
      if (dryRun) setPreview(body)
      else {
        setDone(body)
        setPreview(null)
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy('')
      setProgress('')
    }
  }

  const report = done ?? preview
  return (
    <div style={{ display: 'grid', gap: 24, maxWidth: 820, margin: '32px 0 64px' }}>
      <header style={{ display: 'grid', gap: 6 }}>
        <h1 style={{ margin: 0 }}>Import &amp; export</h1>
        <p style={muted}>
          Every setting and every piece of content (projects, experience, posts, pages, colours, the pet…) in one JSON file. Rich text is Markdown and images are links, so you can edit it by hand or have an AI fill it in. User accounts and passwords are never included.
        </p>
      </header>

      <section style={card}>
        <h3 style={{ margin: 0 }}>1. Export</h3>
        <p style={muted}>
          <strong>Full backup (.zip)</strong>: site.json with every setting and entry (drafts and their live versions) plus every file in the media library. Importing it restores everything. <strong>site.json</strong> alone is the same without the image files (images stay as links): the one to edit or give to an AI.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button type="button" style={button(true)} onClick={() => exportWith(downloadBackup)} disabled={busy !== ''}>
            Download full backup (.zip)
          </button>
          <button type="button" style={button()} onClick={() => exportWith(downloadJson)} disabled={busy !== ''}>
            Download site.json
          </button>
          {busy === 'export' && progress ? <span style={muted}>{progress}</span> : null}
        </div>
      </section>

      <section style={card}>
        <h3 style={{ margin: 0 }}>2. Fill it in with an AI (optional)</h3>
        <p style={muted}>
          Give an AI assistant this prompt, the downloaded file, and your own details (résumé, LinkedIn text, project notes). It replies with a new site.json in the same shape.
        </p>
        <pre style={{ margin: 0, maxHeight: 180, overflow: 'auto', padding: 12, borderRadius: 6, background: 'var(--theme-elevation-50)', fontSize: 12, whiteSpace: 'pre-wrap' }}>{prompt}</pre>
        <button
          type="button"
          style={button()}
          onClick={() => {
            void navigator.clipboard.writeText(prompt).then(() => {
              setCopied(true)
              window.setTimeout(() => setCopied(false), 2000)
            })
          }}
        >
          {copied ? 'Copied' : 'Copy prompt'}
        </button>
      </section>

      <section style={card}>
        <h3 style={{ margin: 0 }}>3. Import</h3>
        <p style={muted}>
          Choose a full backup (.zip) or a site.json, or paste the JSON, then preview. Settings are replaced; entries are matched by slug (or title): the same slug updates, a new one is created, and drafts stay drafts. Nothing is deleted. Images come from the backup, or are downloaded from their links.
        </p>
        <input
          type="file"
          accept="application/json,.json,application/zip,.zip"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (!file) return
            setPreview(null)
            setDone(null)
            setError('')
            setUploadNote('')
            readBackup(file).then(
              (b) => {
                setFileName(file.name)
                setText(b.json)
                setFiles(b.files)
              },
              (err: Error) => setError(err.message),
            )
          }}
        />
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setFileName('')
            setFiles([])
            setPreview(null)
            setDone(null)
          }}
          placeholder="…or paste site.json here"
          spellCheck={false}
          style={{ width: '100%', minHeight: 160, padding: 12, borderRadius: 6, border: '1px solid var(--theme-elevation-150)', background: 'var(--theme-input-bg, var(--theme-elevation-50))', color: 'var(--theme-text)', font: '12px/1.5 ui-monospace, monospace' }}
        />
        {fileName ? (
          <p style={muted}>
            Loaded {fileName}
            {files.length ? `, with ${files.length} image files` : ''}.
          </p>
        ) : null}
        {busy && progress ? <p style={muted}>{progress}</p> : null}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" style={button()} onClick={() => send(true)} disabled={!text.trim() || busy !== ''}>
            {busy === 'preview' ? 'Checking…' : 'Preview changes'}
          </button>
          <button type="button" style={button(true)} onClick={() => send(false)} disabled={!preview || busy !== ''} title={preview ? '' : 'Preview first'}>
            {busy === 'import' ? 'Importing…' : 'Import'}
          </button>
        </div>
        {error ? (
          <p role="alert" style={{ ...muted, color: 'var(--theme-error-500)' }}>
            {error}
          </p>
        ) : null}
        {report ? (
          <div style={{ display: 'grid', gap: 8, padding: 14, borderRadius: 6, background: 'var(--theme-elevation-50)' }}>
            <strong>{done ? 'Imported. The site updates within a few minutes.' : 'Preview: nothing has changed yet.'}</strong>
            <p style={muted}>
              {report.globals.length} settings pages · {report.created.length} new · {report.updated.length} updated · {files.length ? `${files.length} image files in the backup` : `${report.images.length} images to download`}
              {report.warnings.length ? ` · ${report.warnings.length} warnings` : ''}
            </p>
            <List title="New entries" items={report.created} />
            <List title="Updated entries" items={report.updated} />
            <List title="Settings pages" items={report.globals} />
            <List title="Images" items={report.images} />
            <List title="Warnings" items={report.warnings} />
            {uploadNote ? <p style={muted}>{uploadNote}</p> : null}
          </div>
        ) : null}
      </section>
    </div>
  )
}
