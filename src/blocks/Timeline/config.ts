import type { Block } from 'payload'

export const Timeline: Block = {
  slug: 'timeline',
  interfaceName: 'TimelineBlock',
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'Timeline' },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      admin: { components: { RowLabel: '@/components/admin/LabelRowLabel#LabelRowLabel' } },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'when', type: 'text', required: true, admin: { width: '30%', description: 'e.g. July 2026' } },
            { name: 'title', type: 'text', required: true, admin: { width: '70%' } },
          ],
        },
        { name: 'text', type: 'textarea' },
      ],
    },
  ],
}
