import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { supabaseStrategy } from './supabaseStrategy'

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
    group: 'Library',
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
  },
  // GitHub sign-in through Supabase, plus the original email/password login as a backup.
  auth: { strategies: [supabaseStrategy] },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
  ],
  timestamps: true,
}
