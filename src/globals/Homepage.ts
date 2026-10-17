import type { GlobalConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { colorField } from '@/fields/color'
import { revalidateGlobalPaths } from '@/hooks/revalidate'
import { previewUrl } from '@/utilities/previewUrl'

/**
 * The homepage is a sequenced conversation. Each message is a bubble. Inline links are written
 * as [label](/path) inside the message text, and "choices" render as link bubbles under the
 * message. Reveal delay is the pause (with a typing indicator) before the bubble appears.
 */
export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: 'Homepage conversation',
  access: { read: () => true, update: authenticated },
  admin: {
    group: 'Homepage', livePreview: { url: () => previewUrl('/') }, preview: () => previewUrl('/') },
  versions: { drafts: true, max: 30 },
  hooks: { afterChange: [revalidateGlobalPaths(['/'])] },
  fields: [
    {
      name: 'messages',
      type: 'array',
      label: 'Messages',
      minRows: 1,
      admin: {
        description:
          'Shown in order. Write inline links as [label](/projects) or [label](https://example.com). Drag rows to reorder.',
        components: { RowLabel: '@/components/admin/MessageRowLabel#MessageRowLabel' },
      },
      fields: [
        { name: 'content', type: 'textarea', required: true, admin: { rows: 2 } },
        {
          type: 'row',
          fields: [
            {
              name: 'style',
              type: 'select',
              defaultValue: 'default',
              options: [
                { label: 'Default', value: 'default' },
                { label: 'Accent', value: 'accent' },
                { label: 'Muted', value: 'muted' },
              ],
              admin: { width: '33%' },
            },
            {
              name: 'revealDelay',
              type: 'number',
              min: 0,
              max: 10000,
              admin: { width: '33%', description: 'Optional. Typing time in ms. Leave empty for the default: characters × 20 ms + 500 ms.' },
            },
            { name: 'enabled', type: 'checkbox', defaultValue: true, admin: { width: '33%' } },
          ],
        },
        {
          name: 'choices',
          type: 'array',
          label: 'Navigation choices',
          admin: {
            description: 'Optional link bubbles rendered under this message.',
            components: { RowLabel: '@/components/admin/LabelRowLabel#LabelRowLabel' },
          },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'label', type: 'text', required: true, admin: { width: '50%' } },
                { name: 'href', type: 'text', required: true, admin: { width: '50%', description: '/projects, /blog, /about, /contact or a full URL' } },
              ],
            },
            { name: 'newTab', type: 'checkbox', defaultValue: false },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Animation',
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'animationPreset',
              type: 'select',
              defaultValue: 'calm',
              options: [
                { label: 'Calm', value: 'calm' },
                { label: 'Snappy', value: 'snappy' },
                { label: 'Instant (no sequencing)', value: 'instant' },
              ],
              admin: { width: '50%' },
            },
            {
              name: 'typingIndicator',
              type: 'select',
              defaultValue: 'dots',
              options: [
                { label: 'Three dots', value: 'dots' },
                { label: 'None', value: 'none' },
              ],
              admin: { width: '50%' },
            },
          ],
        },
        { name: 'startDelay', type: 'number', defaultValue: 400, min: 0, max: 5000, admin: { description: 'Milliseconds before the first bubble starts typing.' } },
      ],
    },
    {
      name: 'meta',
      type: 'group',
      label: 'SEO',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
      ],
    },
    {
      type: 'collapsible',
      label: 'Conversation look (empty keeps the original colours)',
      fields: [
        colorField('pageBackground', 'Page background', 'Default black (white in the light theme).'),
        colorField('bubbleColor', 'Bubble colour', 'Default a translucent grey.'),
        colorField('textColor', 'Text colour'),
        colorField('linkColor', 'Link colour', 'Default #0076ff.'),
      ],
    },
  ],
}
