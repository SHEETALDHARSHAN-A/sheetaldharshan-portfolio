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
    defaultColumns: ['name', 'email', 'githubUsername'],
    useAsTitle: 'name',
    description:
      'People who can sign in to this admin. To add someone: Create new, enter their name, email, a password to share with them, and their GitHub username; they sign in with the password, then confirm with that GitHub account.',
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
    {
      name: 'githubUsername',
      type: 'text',
      label: 'GitHub username',
      unique: true,
      admin: {
        description:
          'The GitHub account this person confirms sign-in with (the second step) and resets their password with, e.g. octocat. Empty: the accounts listed in src/config/admin.ts are used.',
      },
      hooks: {
        // "@OctoCat " and "OctoCat" are the same account; GitHub usernames are not case-sensitive.
        beforeValidate: [({ value }) => (typeof value === 'string' ? value.trim().replace(/^@/, '').toLowerCase() || null : value)],
      },
    },
  ],
  timestamps: true,
}
