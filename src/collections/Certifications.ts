import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { revalidateCollectionDelete, revalidateCollectionPaths } from '@/hooks/revalidate'

export const Certifications: CollectionConfig = {
  slug: 'certifications',
  access: { create: authenticated, delete: authenticated, read: authenticatedOrPublished, update: authenticated },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'issuer', 'year', '_status'], group: 'About page' },
  hooks: { afterChange: [revalidateCollectionPaths(['/about'])], afterDelete: [revalidateCollectionDelete(['/about'])] },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        { name: 'issuer', type: 'text', admin: { width: '50%' } },
        { name: 'year', type: 'text', admin: { width: '50%' } },
      ],
    },
    { name: 'url', type: 'text' },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
  versions: { drafts: true, maxPerDoc: 10 },
}
