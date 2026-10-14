import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { revalidateCollectionDelete, revalidateCollectionPaths } from '@/hooks/revalidate'

export const Experience: CollectionConfig = {
  slug: 'experience',
  access: { create: authenticated, delete: authenticated, read: authenticatedOrPublished, update: authenticated },
  admin: { useAsTitle: 'role', defaultColumns: ['role', 'company', 'startDate', 'current', '_status'], group: 'Profile' },
  hooks: { afterChange: [revalidateCollectionPaths(['/about'])], afterDelete: [revalidateCollectionDelete(['/about'])] },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'role', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'company', type: 'text', required: true, admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'companyUrl', type: 'text', admin: { width: '50%' } },
        { name: 'location', type: 'text', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'startDate', type: 'date', required: true, admin: { width: '40%', date: { pickerAppearance: 'monthOnly', displayFormat: 'MMM yyyy' } } },
        { name: 'endDate', type: 'date', admin: { width: '40%', date: { pickerAppearance: 'monthOnly', displayFormat: 'MMM yyyy' } } },
        { name: 'current', type: 'checkbox', defaultValue: false, admin: { width: '20%' } },
      ],
    },
    { name: 'summary', type: 'textarea', admin: { description: 'High level, public, approved information only.' } },
    { name: 'highlights', type: 'array', fields: [{ name: 'text', type: 'text', required: true }] },
    { name: 'technologies', type: 'array', fields: [{ name: 'name', type: 'text', required: true }], admin: { components: { RowLabel: '@/components/admin/LabelRowLabel#LabelRowLabel' } } },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
  versions: { drafts: true, maxPerDoc: 10 },
}
