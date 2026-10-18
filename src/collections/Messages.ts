import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'

/** Messages sent from the Contact page form (src/endpoints/contact.ts). Only admins can read them. */
export const Messages: CollectionConfig = {
  slug: 'messages',
  labels: { singular: 'Message', plural: 'Messages' },
  admin: {
    group: 'Contact page',
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'topic', 'handled', 'createdAt'],
    description: 'Messages from the Contact page form. Reply by email, then tick "Handled".',
  },
  // Created only by the contact endpoint (with checks); never through the public API.
  access: { create: () => false, read: authenticated, update: authenticated, delete: authenticated },
  defaultSort: '-createdAt',
  timestamps: true,
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'email', type: 'email', required: true, admin: { width: '50%' } },
      ],
    },
    { name: 'phone', type: 'text', admin: { description: 'Optional.' } },
    { name: 'topic', type: 'text', admin: { description: 'The first choice question\'s answer.' } },
    { name: 'message', type: 'textarea', required: true },
    {
      name: 'answers',
      type: 'array',
      label: 'All answers',
      admin: { readOnly: true, description: 'Every question asked, as answered (including any added later).' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'question', type: 'text', admin: { width: '40%' } },
            { name: 'answer', type: 'textarea', admin: { width: '60%' } },
          ],
        },
      ],
    },
    { name: 'handled', type: 'checkbox', label: 'Handled', defaultValue: false, admin: { position: 'sidebar' } },
    { name: 'page', type: 'text', admin: { position: 'sidebar', readOnly: true, description: 'Where it was sent from.' } },
  ],
}
