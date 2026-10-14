import { getPayload, type Payload } from 'payload'
import config from '../../src/payload.config.js'

let client: Payload | null = null

export async function payloadClient(): Promise<Payload> {
  if (!client) client = await getPayload({ config })
  return client
}

/** Remove documents created by the e2e suite. Matched by the e2e- prefix on slugs. */
export async function cleanupE2E(): Promise<void> {
  const payload = await payloadClient()
  for (const collection of ['projects', 'posts', 'pages'] as const) {
    await payload.delete({ collection, where: { or: [{ slug: { like: 'e2e-' } }, { title: { like: 'E2E' } }] }, context: { disableRevalidate: true } })
  }
  // Autosave can leave slug-less draft rows behind; remove any project without a slug.
  await payload.delete({ collection: 'projects', where: { slug: { exists: false } }, context: { disableRevalidate: true } })
}
