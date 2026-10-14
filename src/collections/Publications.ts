import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'

export const Publications: CollectionConfig = {
  slug: 'publications',
  access: { create: authenticated, delete: authenticated, read: authenticatedOrPublished, update: authenticated },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'year', 'featured'] },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'authors', type: 'text', required: true },
    { name: 'year', type: 'number' },
    { name: 'publisher', type: 'text' },
    { name: 'venue', type: 'text' },
    { name: 'doi', type: 'text' },
    { name: 'externalUrl', type: 'text' },
    { name: 'abstract', type: 'textarea' },
    { name: 'personalContribution', type: 'textarea' },
    { name: 'featured', type: 'checkbox', defaultValue: false },
  ],
  versions: { drafts: true, maxPerDoc: 20 },
}
