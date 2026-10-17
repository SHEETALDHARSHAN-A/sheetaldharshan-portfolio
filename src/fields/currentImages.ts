import type { UIField } from 'payload'
import type { CurrentImageItem } from '@/components/admin/CurrentImages'

/** An "In use now" preview for upload fields (see CurrentImages). */
export const currentImages = (name: string, items: CurrentImageItem[]): UIField => ({
  name,
  type: 'ui',
  admin: { components: { Field: { path: '@/components/admin/CurrentImages#CurrentImages', clientProps: { items } } } },
})
