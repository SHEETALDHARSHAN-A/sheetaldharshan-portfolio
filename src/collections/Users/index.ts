import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    group: 'Admin panel',
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
  },
  // Email and password; src/proxy.ts then asks for a GitHub check before the session counts.
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Your picture in the admin (top right). Empty: the default avatar from Site-wide → Admin look.' },
    },
  ],
  timestamps: true,
}
