import type { GlobalConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { revalidateGlobalPaths } from '@/hooks/revalidate'

/** The sidebar companion: its sprite sheet and where it appears. */
export const Pet: GlobalConfig = {
  slug: 'pet',
  label: 'Pet',
  admin: {
    group: 'Sidebar',
    description: 'The animated character in the sidebar (bottom-right on phones). Clicking it opens site search.',
  },
  access: { read: () => true, update: authenticated },
  hooks: { afterChange: [revalidateGlobalPaths(['/projects', '/blog', '/about', '/contact', '/research'])] },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: true, label: 'Show the pet', admin: { width: '50%' } },
        { name: 'showOnPhones', type: 'checkbox', defaultValue: true, label: 'Show on phones too', admin: { width: '50%' } },
      ],
    },
    {
      name: 'sprite',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Optional: a new sprite sheet in the Codex pet format (8 columns × 11 rows of 192×208 frames, 1536×2288 px, transparent PNG or WebP). Leave empty to keep the current pet.',
      },
    },
  ],
}
