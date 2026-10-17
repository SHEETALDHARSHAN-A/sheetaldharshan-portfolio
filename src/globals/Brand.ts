import type { GlobalConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { revalidateGlobalPaths } from '@/hooks/revalidate'

/** Browser-tab and home-screen icons. Empty fields keep the built-in SD logo. */
export const Brand: GlobalConfig = {
  slug: 'brand',
  label: 'Favicon & icons',
  admin: {
    group: 'Site-wide',
    description: 'The icon in browser tabs, Google results and phone home screens. Leave a field empty to keep the current SD logo. Your About photo is under Pages → About; the link-preview image is under Sidebar → Name & profiles.',
  },
  access: { read: () => true, update: authenticated },
  hooks: { afterChange: [revalidateGlobalPaths(['/', '/projects', '/blog', '/about', '/contact', '/research'])] },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'faviconLight', type: 'upload', relationTo: 'media', label: 'Favicon on light tabs', admin: { width: '50%', description: 'Square SVG or PNG (at least 96×96). Usually a dark logo.' } },
        { name: 'faviconDark', type: 'upload', relationTo: 'media', label: 'Favicon on dark tabs', admin: { width: '50%', description: 'Optional. Usually a light logo. If empty, the light-tab icon is used everywhere.' } },
      ],
    },
    { name: 'appleIcon', type: 'upload', relationTo: 'media', label: 'Home-screen icon', admin: { description: 'Square PNG, 180×180 or larger, solid background (iPhone and Android shortcuts).' } },
  ],
}
