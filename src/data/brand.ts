import { cache } from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { toMediaRef } from '@/data/media'
import type { MediaRef } from '@/data/types'

export type PetSettings = { enabled: boolean; showOnPhones: boolean; sprite?: string }
export type BrandIcons = { faviconLight?: MediaRef; faviconDark?: MediaRef; appleIcon?: MediaRef }

/** Pet settings from the admin (Sidebar → Pet); defaults keep the built-in pet. */
export const getPetSettings = cache(async (): Promise<PetSettings> => {
  const payload = await getPayload({ config: configPromise })
  const doc = (await payload.findGlobal({ slug: 'pet', depth: 1 }).catch(() => null)) as { enabled?: boolean | null; showOnPhones?: boolean | null; sprite?: unknown } | null
  return { enabled: doc?.enabled ?? true, showOnPhones: doc?.showOnPhones ?? true, sprite: toMediaRef(doc?.sprite)?.url }
})

/** Uploaded favicons (Brand → Favicon & icons); empty fields fall back to the built-in SD logo. */
export const getBrandIcons = cache(async (): Promise<BrandIcons> => {
  const payload = await getPayload({ config: configPromise })
  const doc = (await payload.findGlobal({ slug: 'brand', depth: 1 }).catch(() => null)) as { faviconLight?: unknown; faviconDark?: unknown; appleIcon?: unknown } | null
  return { faviconLight: toMediaRef(doc?.faviconLight), faviconDark: toMediaRef(doc?.faviconDark), appleIcon: toMediaRef(doc?.appleIcon) }
})
