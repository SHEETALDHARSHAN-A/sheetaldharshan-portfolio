import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

describe('Content persistence', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  it('stores published projects in PostgreSQL', async () => {
    const result = await payload.find({ collection: 'projects', where: { _status: { equals: 'published' } } })
    expect(result.totalDocs).toBeGreaterThanOrEqual(1)
    expect(result.docs[0].slug).toBeTruthy()
  })

  it('exposes the homepage conversation from the global', async () => {
    const homepage = await payload.findGlobal({ slug: 'homepage' })
    expect((homepage.messages ?? []).length).toBeGreaterThan(0)
  })

  it('keeps draft projects out of public reads', async () => {
    const result = await payload.find({ collection: 'projects', overrideAccess: false, where: { slug: { equals: 'signsense' } } })
    expect(result.totalDocs).toBe(0)
  })
})
