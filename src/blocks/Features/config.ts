import type { Block } from 'payload'

export const Features: Block = {
  slug: 'features',
  interfaceName: 'FeaturesBlock',
  labels: { singular: 'Feature list', plural: 'Feature lists' },
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'What it does' },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      admin: { components: { RowLabel: '@/components/admin/LabelRowLabel#LabelRowLabel' } },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'text', type: 'textarea' },
      ],
    },
  ],
}
