import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { revalidateCollectionDelete, revalidateCollectionPaths } from '@/hooks/revalidate'

export const Education: CollectionConfig = {
  slug: 'education',
  access: { create: authenticated, delete: authenticated, read: authenticatedOrPublished, update: authenticated },
  admin: { useAsTitle: 'institution', defaultColumns: ['institution', 'degree', 'endDate', '_status'], group: 'Profile' },
  hooks: { afterChange: [revalidateCollectionPaths(['/about'])], afterDelete: [revalidateCollectionDelete(['/about'])] },
  fields: [
    { name: 'institution', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        { name: 'degree', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'field', type: 'text', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'startDate', type: 'date', admin: { width: '50%', date: { pickerAppearance: 'monthOnly', displayFormat: 'MMM yyyy' } } },
        { name: 'endDate', type: 'date', admin: { width: '50%', date: { pickerAppearance: 'monthOnly', displayFormat: 'MMM yyyy' } } },
      ],
    },
    { name: 'location', type: 'text' },
    { name: 'notes', type: 'textarea' },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
  versions: { drafts: true, maxPerDoc: 10 },
}
