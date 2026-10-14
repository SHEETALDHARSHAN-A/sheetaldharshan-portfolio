import type { Block } from 'payload'

export const Stats: Block = {
  slug: 'stats',
  interfaceName: 'StatsBlock',
  labels: { singular: 'Facts', plural: 'Facts' },
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'Facts' },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      admin: {
        description: 'Only verifiable facts: counts, versions, dates. Nothing estimated.',
        components: { RowLabel: '@/components/admin/LabelRowLabel#LabelRowLabel' },
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'value', type: 'text', required: true, admin: { width: '30%' } },
            { name: 'label', type: 'text', required: true, admin: { width: '70%' } },
          ],
        },
      ],
    },
  ],
}
