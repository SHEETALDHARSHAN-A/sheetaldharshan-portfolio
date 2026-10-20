import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  labels: { singular: 'Channel', plural: 'Channels' },
  admin: {
    group: 'Field Notes',
    useAsTitle: 'title',
    defaultColumns: ['title', 'emoji', 'order', 'slug'],
    description: 'Field Notes channels, like Slack channels. Readers can star them; posts pick theirs under Channels.',
  },
  defaultSort: 'order',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      type: 'row',
      fields: [
        { name: 'emoji', type: 'text', admin: { width: '25%', description: 'Optional, shown instead of #.' } },
        { name: 'order', type: 'number', defaultValue: 0, admin: { width: '25%', description: 'Lower comes first.' } },
      ],
    },
    { name: 'description', type: 'textarea', admin: { description: 'One or two lines at the top of the channel.' } },
    slugField({
      position: undefined,
    }),
  ],
}
