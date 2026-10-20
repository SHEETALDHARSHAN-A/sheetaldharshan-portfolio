import type { GlobalConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { revalidateGlobalPaths } from '@/hooks/revalidate'
import { currentImages } from '@/fields/currentImages'

// Everything the sprite sheet can act out. Each maps to one of its animation rows.
const EMOTIONS = [
  { label: 'Nothing', value: 'none' },
  { label: 'Wave hi', value: 'wave' },
  { label: 'Jump for joy', value: 'jump' },
  { label: 'Think (reads something)', value: 'think' },
  { label: 'Get busy (works away)', value: 'work' },
  { label: 'Wait patiently', value: 'wait' },
  { label: 'Look sad (oops)', value: 'sad' },
  { label: 'Look around', value: 'look' },
]
const IDLE_ACTIONS = [...EMOTIONS, { label: 'Stroll across the sidebar', value: 'stroll' }]

/** The sidebar companion: its sprite sheet and where it appears. */
export const Pet: GlobalConfig = {
  slug: 'pet',
  label: 'Pet',
  admin: {
    group: 'Sidebar',
    description: 'The animated character in the sidebar (bottom-right on phones). Clicking it opens site search.',
  },
  access: { read: () => true, update: authenticated },
  hooks: { afterChange: [revalidateGlobalPaths(['/projects', '/notes', '/about', '/contact', '/research'])] },
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
    currentImages('spriteInUse', [{ label: 'Pet', watch: 'sprite', fallback: '/pet/curly-hoodie.webp', fallbackLabel: 'Built-in pet (curly hoodie)', sprite: true }]),
    {
      type: 'collapsible',
      label: 'Behaviour',
      admin: { description: 'What the pet does on its own and how it reacts. Pick from the emotions its sprite sheet can act out.' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'idleAfter',
              type: 'number',
              label: 'Visitor idle after (seconds)',
              defaultValue: 30,
              min: 5,
              max: 600,
              admin: { width: '33%', description: 'No mouse, scroll, touch or typing for this long.' },
            },
            { name: 'idleAction', type: 'select', label: 'Then the pet will', defaultValue: 'wait', options: IDLE_ACTIONS, admin: { width: '33%' } },
            {
              name: 'idleRepeat',
              type: 'checkbox',
              label: 'Keep it up while the visitor is away',
              defaultValue: true,
              admin: { width: '33%', description: 'Off: it does it once.' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'returnAction', type: 'select', label: 'When the visitor comes back', defaultValue: 'wave', options: EMOTIONS, admin: { width: '33%' } },
            { name: 'clickAction', type: 'select', label: 'When clicked (search opens)', defaultValue: 'wave', options: EMOTIONS, admin: { width: '33%' } },
            { name: 'dropAction', type: 'select', label: 'When dragged and dropped', defaultValue: 'none', options: EMOTIONS, admin: { width: '33%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'foundAction', type: 'select', label: 'When search finds results', defaultValue: 'none', options: EMOTIONS, admin: { width: '33%' } },
            { name: 'emptyAction', type: 'select', label: 'When search finds nothing', defaultValue: 'none', options: EMOTIONS, admin: { width: '33%' } },
            { name: 'followCursor', type: 'checkbox', label: 'Follow the cursor with its eyes', defaultValue: true, admin: { width: '33%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'stroll', type: 'checkbox', label: 'Stroll now and then', defaultValue: true, admin: { width: '33%' } },
            {
              name: 'strollEvery',
              type: 'number',
              label: 'About every (seconds)',
              defaultValue: 40,
              min: 10,
              max: 600,
              admin: { width: '33%', condition: (_, siblingData) => Boolean(siblingData?.stroll) },
            },
          ],
        },
      ],
    },
  ],
}
