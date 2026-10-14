import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { revalidateCollectionDelete, revalidateCollectionPaths } from '@/hooks/revalidate'

export const Publications: CollectionConfig = {
  slug: 'publications',
  access: { create: authenticated, delete: authenticated, read: authenticatedOrPublished, update: authenticated },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'year', 'featured', '_status'], group: 'Profile' },
  hooks: { afterChange: [revalidateCollectionPaths(['/research', '/about'])], afterDelete: [revalidateCollectionDelete(['/research', '/about'])] },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'authors', type: 'text', required: true, admin: { description: 'In published order, comma separated.' } },
    {
      type: 'row',
      fields: [
        { name: 'year', type: 'number', admin: { width: '33%' } },
        { name: 'publisher', type: 'text', admin: { width: '33%' } },
        { name: 'kind', type: 'select', defaultValue: 'conference', options: [{ label: 'Conference paper', value: 'conference' }, { label: 'Journal article', value: 'journal' }, { label: 'Preprint', value: 'preprint' }, { label: 'Other', value: 'other' }], admin: { width: '34%' } },
      ],
    },
    { name: 'venue', type: 'text', admin: { description: 'Conference or journal' } },
    {
      type: 'row',
      fields: [
        { name: 'doi', type: 'text', admin: { width: '50%' } },
        { name: 'externalUrl', type: 'text', admin: { width: '50%' } },
      ],
    },
    { name: 'abstract', type: 'textarea' },
    { name: 'personalContribution', type: 'textarea', admin: { description: 'Exactly what you did. Nothing more.' } },
    { name: 'tags', type: 'array', fields: [{ name: 'name', type: 'text', required: true }] },
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
  versions: { drafts: true, maxPerDoc: 20 },
}
