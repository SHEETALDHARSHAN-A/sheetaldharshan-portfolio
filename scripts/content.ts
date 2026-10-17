/**
 * Export or import the whole site as one JSON file (see docs/site-json.md).
 *
 *   pnpm content:export [file]            writes content/site.json by default
 *   pnpm content:import <file> [--dry-run]
 *
 * Uses DATABASE_URL from .env, so point it at the database you mean to read or change.
 */
import 'dotenv/config'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { exportSite, importSite } from '../src/utilities/siteData'

const [command, file, ...rest] = process.argv.slice(2)
const base = (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').replace(/\/$/, '')
const payload = await getPayload({ config })

if (command === 'export') {
  const out = file || 'content/site.json'
  mkdirSync(dirname(out), { recursive: true })
  const json = await exportSite(payload, base)
  writeFileSync(out, `${JSON.stringify(json, null, 2)}\n`)
  const counts = Object.entries(json.collections).map(([k, v]) => `${v?.length ?? 0} ${k}`)
  console.log(`Wrote ${out}: ${Object.keys(json.globals).length} settings pages, ${counts.join(', ')}.`)
} else if (command === 'import' && file) {
  const dryRun = rest.includes('--dry-run')
  const report = await importSite(payload, JSON.parse(readFileSync(file, 'utf8')), { dryRun, base, disableRevalidate: true })
  console.log(dryRun ? 'Dry run: nothing was changed.' : 'Imported.')
  console.log(`Settings: ${report.globals.join(', ') || 'none'}`)
  console.log(`New entries (${report.created.length}): ${report.created.join('; ') || 'none'}`)
  console.log(`Updated entries (${report.updated.length}): ${report.updated.join('; ') || 'none'}`)
  if (report.images.length) console.log(`Images ${dryRun ? 'to download' : 'downloaded'} (${report.images.length}): ${report.images.join(', ')}`)
  for (const w of report.warnings) console.warn(`Warning: ${w}`)
} else {
  console.log('Usage: pnpm content:export [file]  |  pnpm content:import <file> [--dry-run]')
  process.exitCode = 1
}
process.exit()
