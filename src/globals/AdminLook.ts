import type { GlobalConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { colorField } from '@/fields/color'
import { currentImages } from '@/fields/currentImages'
import { BODY_FONTS } from '@/styles/theme'

/** How this admin looks: its logo, menu icon, default avatar, colours and font. */
export const AdminLook: GlobalConfig = {
  slug: 'admin-look',
  label: 'Admin look',
  admin: {
    group: 'Admin panel',
    description: 'The look of this admin panel only; the public site is under Appearance. Empty fields keep the built-in SD logo and Payload’s colours. Reload after saving to see it.',
  },
  access: { read: authenticated, update: authenticated },
  fields: [
    {
      type: 'collapsible',
      label: 'Logo and icons',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'logo', type: 'upload', relationTo: 'media', label: 'Login page logo', admin: { width: '50%', description: 'Square or wide image, shown above the sign-in form.' } },
            { name: 'logoText', type: 'text', label: 'Name beside the logo', defaultValue: 'sheetaldharshan.me', admin: { width: '50%', description: 'Leave empty to show the logo alone.' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'icon', type: 'upload', relationTo: 'media', label: 'Menu icon', admin: { width: '50%', description: 'Small square image at the top of the admin menu.' } },
            { name: 'avatar', type: 'upload', relationTo: 'media', label: 'Default avatar', admin: { width: '50%', description: 'Top right, for users without their own photo (Users → photo).' } },
          ],
        },
        currentImages('logosInUse', [
          { label: 'Login logo', watch: 'logo', fallback: '/icon.svg', fallbackLabel: 'Built-in SD logo' },
          { label: 'Menu icon', watch: 'icon', chain: ['logo'], fallback: '/icon.svg', fallbackLabel: 'Built-in SD logo' },
          { label: 'Default avatar', watch: 'avatar', chain: ['icon', 'logo'], fallback: '/icon-512.png', fallbackLabel: 'Built-in SD logo' },
        ]),
      ],
    },
    {
      type: 'collapsible',
      label: 'Colours and font',
      fields: [
        {
          type: 'row',
          fields: [
            colorField('accentColor', 'Accent', 'Links, toggles, focus rings and the “in use” labels.', '33%'),
            colorField('backgroundDark', 'Background (dark mode)', undefined, '33%'),
            colorField('backgroundLight', 'Background (light mode)', undefined, '33%'),
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'font',
              type: 'select',
              label: 'Font',
              defaultValue: 'system',
              options: [{ label: 'System (Payload default)', value: 'system' }, ...Object.entries(BODY_FONTS).map(([value, f]) => ({ label: f.family, value }))],
              admin: { width: '33%' },
            },
            {
              name: 'radius',
              type: 'select',
              label: 'Corners',
              defaultValue: 'default',
              options: [
                { label: 'Payload default', value: 'default' },
                { label: 'Rounder', value: 'round' },
                { label: 'Square', value: 'square' },
              ],
              admin: { width: '33%' },
            },
          ],
        },
      ],
    },
  ],
}
