import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { slugField } from 'payload'

export const Projects: CollectionConfig = {
  slug: 'projects',
  access: { create: authenticated, delete: authenticated, read: authenticatedOrPublished, update: authenticated },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'status', 'featured', 'updatedAt'] },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'summary', type: 'textarea', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'category', type: 'text' },
    { name: 'technologies', type: 'array', fields: [{ name: 'name', type: 'text', required: true }] },
    { name: 'status', type: 'select', defaultValue: 'draft', options: ['draft', 'published', 'archived'], admin: { position: 'sidebar' } },
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    { name: 'displayOrder', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
    { name: 'githubUrl', type: 'text' },
    { name: 'liveDemoUrl', type: 'text' },
    { name: 'documentationUrl', type: 'text' },
    { name: 'accent', type: 'text', defaultValue: '#d6ff5f' },
    { name: 'content', type: 'richText' },
    { name: 'meta', type: 'group', fields: [{ name: 'title', type: 'text' }, { name: 'description', type: 'textarea' }] },
    slugField(),
  ],
  versions: { drafts: true, maxPerDoc: 20 },
}
