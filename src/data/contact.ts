import { cache } from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { toContactSettings, type ContactSettings } from '@/utilities/contactFields'

/** Contact page settings (Contact page → Contact page), checked, with the defaults filled in. */
export const getContactSettings = cache(async (): Promise<ContactSettings> => {
  const payload = await getPayload({ config: configPromise })
  const doc = (await payload.findGlobal({ slug: 'contact-page' as never, depth: 0 })) as unknown as Record<string, unknown> | null
  return toContactSettings(doc)
})
