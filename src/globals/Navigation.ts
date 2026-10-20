import type { GlobalConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { colorField } from '@/fields/color'
import { revalidateGlobalPaths } from '@/hooks/revalidate'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Menu links',
  admin: { group: 'Sidebar', description: 'The numbered menu in the sidebar (and the phone tab bar), plus the small footer links.' },
  access: { read: () => true, update: authenticated },
  hooks: { afterChange: [revalidateGlobalPaths(['/', '/projects', '/notes', '/about', '/contact', '/research'])] },
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
    {
      type: 'collapsible',
      label: 'Sidebar look (empty uses the theme)',
      fields: [
        colorField('sidebarBackground', 'Sidebar background'),
        colorField('wordmarkColor', 'Name (wordmark) colour'),
        colorField('wordmarkDotColor', 'Dot after the name', 'Default: the accent colour.'),
        colorField('menuColor', 'Menu text colour'),
        colorField('menuActiveColor', 'Menu hover and current page', 'Default: the accent colour.'),
        { name: 'menuFontSize', type: 'number', min: 14, max: 36, label: 'Menu font size (px)', admin: { description: 'Default 22.' } },
        { name: 'wordmarkFontSize', type: 'number', min: 16, max: 40, label: 'Name font size (px)', admin: { description: 'Default 24.' } },
      ],
    },
  ],
}
