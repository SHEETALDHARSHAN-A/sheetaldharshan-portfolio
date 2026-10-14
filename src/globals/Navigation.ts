import type { GlobalConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { revalidateGlobalPaths } from '@/hooks/revalidate'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  access: { read: () => true, update: authenticated },
  hooks: { afterChange: [revalidateGlobalPaths(['/', '/projects', '/blog', '/about', '/contact', '/research'])] },
  fields: [
    {
      name: 'items',
      type: 'array',
      label: 'Sidebar navigation',
      admin: {
        description: 'Numbered in the order shown here.',
        components: { RowLabel: '@/components/admin/LabelRowLabel#LabelRowLabel' },
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', required: true, admin: { width: '40%' } },
            { name: 'href', type: 'text', required: true, admin: { width: '40%' } },
            { name: 'visible', type: 'checkbox', defaultValue: true, admin: { width: '20%' } },
          ],
        },
        { name: 'newTab', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'footerLinks',
      type: 'array',
      label: 'Footer links',
      admin: { components: { RowLabel: '@/components/admin/LabelRowLabel#LabelRowLabel' } },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', required: true, admin: { width: '50%' } },
            { name: 'href', type: 'text', required: true, admin: { width: '50%' } },
          ],
        },
      ],
    },
  ],
}
