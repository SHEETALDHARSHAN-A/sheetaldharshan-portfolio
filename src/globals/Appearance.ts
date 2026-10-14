import type { GlobalConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { revalidateGlobalPaths } from '@/hooks/revalidate'
import { previewUrl } from '@/utilities/previewUrl'

/**
 * Appearance uses whitelisted presets only. Each value maps to CSS variables in
 * src/styles/theme.ts; nothing here is injected as raw CSS.
 */
export const Appearance: GlobalConfig = {
  slug: 'appearance',
  access: { read: () => true, update: authenticated },
  hooks: { afterChange: [revalidateGlobalPaths(['/', '/projects', '/blog', '/about', '/contact', '/research'])] },
  admin: { livePreview: { url: () => previewUrl('/projects') } },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'theme',
          type: 'select',
          defaultValue: 'dark',
          options: [
            { label: 'Dark (default)', value: 'dark' },
            { label: 'Light', value: 'light' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'accent',
          type: 'select',
          defaultValue: 'blue',
          options: [
            { label: 'Blue', value: 'blue' },
            { label: 'Orange', value: 'orange' },
            { label: 'Green', value: 'green' },
            { label: 'Violet', value: 'violet' },
            { label: 'Neutral', value: 'neutral' },
          ],
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'fontPreset',
          type: 'select',
          defaultValue: 'inter',
          options: [
            { label: 'Inter', value: 'inter' },
            { label: 'Geist', value: 'geist' },
            { label: 'System', value: 'system' },
          ],
          admin: { width: '33%' },
        },
        {
          name: 'headingScale',
          type: 'select',
          defaultValue: 'regular',
          options: [
            { label: 'Compact', value: 'compact' },
            { label: 'Regular', value: 'regular' },
            { label: 'Large', value: 'large' },
          ],
          admin: { width: '33%' },
        },
        {
          name: 'spacing',
          type: 'select',
          defaultValue: 'regular',
          options: [
            { label: 'Tight', value: 'tight' },
            { label: 'Regular', value: 'regular' },
            { label: 'Airy', value: 'airy' },
          ],
          admin: { width: '33%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'radius',
          type: 'select',
          defaultValue: 'pill',
          options: [
            { label: 'Pill', value: 'pill' },
            { label: 'Rounded', value: 'rounded' },
            { label: 'Square', value: 'square' },
          ],
          admin: { width: '33%' },
        },
        {
          name: 'linkStyle',
          type: 'select',
          defaultValue: 'underline',
          options: [
            { label: 'Underline', value: 'underline' },
            { label: 'Plain', value: 'plain' },
          ],
          admin: { width: '33%' },
        },
        {
          name: 'bubbleStyle',
          type: 'select',
          defaultValue: 'pill',
          options: [
            { label: 'Pill', value: 'pill' },
            { label: 'Rounded', value: 'rounded' },
          ],
          admin: { width: '33%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'animationIntensity',
          type: 'select',
          defaultValue: 'normal',
          options: [
            { label: 'Reduced', value: 'reduced' },
            { label: 'Normal', value: 'normal' },
            { label: 'Expressive', value: 'expressive' },
          ],
          admin: { width: '33%' },
        },
        {
          name: 'animationSpeed',
          type: 'select',
          defaultValue: 'normal',
          options: [
            { label: 'Slow', value: 'slow' },
            { label: 'Normal', value: 'normal' },
            { label: 'Fast', value: 'fast' },
          ],
          admin: { width: '33%' },
        },
        {
          name: 'projectDisplayStyle',
          type: 'select',
          defaultValue: 'explorer',
          options: [
            { label: 'Explorer (list + stage)', value: 'explorer' },
            { label: 'Grid', value: 'grid' },
          ],
          admin: { width: '33%' },
        },
      ],
    },
  ],
}
