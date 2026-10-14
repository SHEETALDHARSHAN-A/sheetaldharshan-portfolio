import type { Block } from 'payload'

export const Links: Block = {
  slug: 'links',
  interfaceName: 'LinksBlock',
  labels: { singular: 'Link list', plural: 'Link lists' },
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'Links' },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      admin: { components: { RowLabel: '@/components/admin/LabelRowLabel#LabelRowLabel' } },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', required: true, admin: { width: '40%' } },
            { name: 'href', type: 'text', required: true, admin: { width: '60%' } },
          ],
        },
        { name: 'note', type: 'text' },
      ],
    },
  ],
}
