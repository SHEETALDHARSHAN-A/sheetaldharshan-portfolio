import type { Block } from 'payload'

export const Gallery: Block = {
  slug: 'gallery',
  interfaceName: 'GalleryBlock',
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'stack',
      options: [
        { label: 'Stacked, full width', value: 'stack' },
        { label: 'Two columns', value: 'two' },
        { label: 'Three columns', value: 'three' },
      ],
    },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'media', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text' },
      ],
    },
  ],
}
