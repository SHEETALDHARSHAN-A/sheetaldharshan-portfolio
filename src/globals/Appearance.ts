import type { GlobalConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { revalidateGlobalPaths } from '@/hooks/revalidate'
import { previewUrl } from '@/utilities/previewUrl'
import { colorField } from '@/fields/color'

/**
 * Appearance uses whitelisted presets only. Each value maps to CSS variables in
 * src/styles/theme.ts; nothing here is injected as raw CSS.
 */
export const Appearance: GlobalConfig = {
  slug: 'appearance',
  label: 'Theme',
  access: { read: () => true, update: authenticated },
  hooks: { afterChange: [revalidateGlobalPaths(['/', '/projects', '/blog', '/about', '/contact', '/research'])] },
  admin: {
    group: 'Site-wide', livePreview: { url: () => previewUrl('/projects') } },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'theme',
          type: 'select',
          label: 'Default mode',
          defaultValue: 'dark',
          options: [
            { label: 'Dark', value: 'dark' },
            { label: 'Light', value: 'light' },
            { label: "Match the visitor's device", value: 'system' },
          ],
          admin: { width: '50%', description: 'What a first-time visitor sees. With the switch on, their own choice is remembered.' },
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
    {
      name: 'themeToggle',
      type: 'checkbox',
      label: 'Show the light/dark switch at the bottom of the sidebar',
      defaultValue: true,
    },
    {
      type: 'collapsible',
      label: 'Colours: a theme, or your own for dark and light mode (empty keeps the preset)',
      fields: [
        { name: 'themePicker', type: 'ui', admin: { components: { Field: '@/components/admin/ThemePresets#ThemePresets' } } },
        {
          type: 'collapsible',
          label: 'Dark mode colours',
          fields: [
            {
              type: 'row',
              fields: [
                colorField('colorBackground', 'Page background', undefined, '33%'),
                colorField('colorSurface', 'Panels, cards and chips', undefined, '33%'),
                colorField('colorText', 'Main text', undefined, '33%'),
              ],
            },
            {
              type: 'row',
              fields: [
                colorField('colorMuted', 'Secondary text', undefined, '33%'),
                colorField('colorAccent', 'Accent', 'Links, highlights, the active menu item.', '33%'),
                colorField('colorLine', 'Lines and borders', undefined, '33%'),
              ],
            },
          ],
        },
        {
          type: 'collapsible',
          label: 'Light mode colours',
          fields: [
            {
              type: 'row',
              fields: [
                colorField('lightBackground', 'Page background', undefined, '33%'),
                colorField('lightSurface', 'Panels, cards and chips', undefined, '33%'),
                colorField('lightText', 'Main text', undefined, '33%'),
              ],
            },
            {
              type: 'row',
              fields: [
                colorField('lightMuted', 'Secondary text', undefined, '33%'),
                colorField('lightAccent', 'Accent', 'Links, highlights, the active menu item.', '33%'),
                colorField('lightLine', 'Lines and borders', undefined, '33%'),
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Fonts',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'bodyFont',
              type: 'select',
              defaultValue: 'preset',
              label: 'Body text',
              admin: { width: '50%', description: '"Preset" uses the Font choice above.' },
              options: [
                { label: 'Preset', value: 'preset' },
                { label: 'IBM Plex Sans', value: 'ibm-plex-sans' },
                { label: 'DM Sans', value: 'dm-sans' },
                { label: 'Manrope', value: 'manrope' },
                { label: 'Work Sans', value: 'work-sans' },
                { label: 'Source Sans 3', value: 'source-sans-3' },
              ],
            },
            {
              name: 'headingFont',
              type: 'select',
              defaultValue: 'barlow-condensed',
              label: 'Headings, menu and labels',
              admin: { width: '50%' },
              options: [
                { label: 'Barlow Condensed (default)', value: 'barlow-condensed' },
                { label: 'Oswald', value: 'oswald' },
                { label: 'Bebas Neue', value: 'bebas-neue' },
                { label: 'Anton', value: 'anton' },
                { label: 'Archivo Narrow', value: 'archivo-narrow' },
                { label: 'Inter Tight', value: 'inter-tight' },
              ],
            },
          ],
        },
      ],
    },
  ],
}
