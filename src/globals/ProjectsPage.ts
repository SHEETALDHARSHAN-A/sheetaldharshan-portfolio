import type { GlobalConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { colorField } from '@/fields/color'
import { revalidateGlobalPaths } from '@/hooks/revalidate'

/** The Projects page's look: card colours, the image stage and how images change. */
export const ProjectsPage: GlobalConfig = {
  slug: 'projects-page',
  label: 'Page settings',
  admin: {
    group: 'Projects page',
    description: 'How the Projects page looks. Each project can override its own colours in its Style & images tab. List or grid layout is under Site-wide → Theme.',
  },
  access: { read: () => true, update: authenticated },
  hooks: { afterChange: [revalidateGlobalPaths(['/projects'])] },
  fields: [
    {
      type: 'collapsible',
      label: 'Colours',
      fields: [
        colorField('cardColor', 'Active card', 'The card that slides out behind the selected project. Default #3a3d44.'),
        colorField('cardTextColor', 'Active card text', 'Default #f3f3eb.'),
        colorField('arrowColor', 'Arrow on the active card', 'Default #ff3d00.'),
        colorField('stageBackground', 'Image stage background', 'Shown behind images while they load.'),
      ],
    },
    {
      type: 'collapsible',
      label: 'Image animation',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'imageTransition',
              type: 'select',
              defaultValue: 'wipe',
              label: 'How the next image appears',
              admin: { width: '50%' },
              options: [
                { label: 'Wipe in from the left (default)', value: 'wipe' },
                { label: 'Cross-fade', value: 'fade' },
                { label: 'Instant', value: 'none' },
              ],
            },
            { name: 'imageZoom', type: 'checkbox', defaultValue: true, label: 'Slow zoom on the image', admin: { width: '25%' } },
            { name: 'zoomSeconds', type: 'number', defaultValue: 14, min: 3, max: 40, label: 'Zoom length (seconds)', admin: { width: '25%' } },
          ],
        },
      ],
    },
  ],
}
