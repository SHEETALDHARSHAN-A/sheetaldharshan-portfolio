import type { GlobalConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { revalidateGlobalPaths } from '@/hooks/revalidate'
import { previewUrl } from '@/utilities/previewUrl'

export const About: GlobalConfig = {
  slug: 'about',
  access: { read: () => true, update: authenticated },
  admin: {
    group: 'About page', livePreview: { url: () => previewUrl('/about') }, preview: () => previewUrl('/about') },
  versions: { drafts: true, max: 20 },
  hooks: { afterChange: [revalidateGlobalPaths(['/about'])] },
  fields: [
    { name: 'eyebrow', type: 'text', defaultValue: 'About' },
    { name: 'title', type: 'text', defaultValue: 'Sheetaldharshan A' },
    { name: 'intro', type: 'textarea', admin: { description: 'Two or three short paragraphs. Blank line between paragraphs.' } },
    { name: 'photo', type: 'upload', relationTo: 'media', admin: { description: 'Best: a portrait photo, 4:5, at least 1200×1500 px. The site cuts it anywhere from 4:5 (tall) to 3:2 (wide), and 1:1 on phones; the guide below shows each cut.' } },
    {
      name: 'photoCrops',
      type: 'ui',
      admin: {
        components: {
          Field: {
            path: '@/components/admin/CropGuide#CropGuide',
            clientProps: {
              watch: 'photo',
              focalX: 'photoFocalX',
              focalY: 'photoFocalY',
              frames: [
                { label: 'Tallest, 4:5: no cards open', short: '4:5 tallest', ratio: 4 / 5, color: '#4ade80' },
                { label: 'Square, 1:1: one card open, and on phones', short: '1:1 square', ratio: 1, color: '#60a5fa' },
                { label: 'Widest, 3:2: cards open on a short screen', short: '3:2 widest', ratio: 3 / 2, color: '#f472b6' },
              ],
              note: 'Upload a portrait photo, 4:5, at least 1200×1500 px.',
            },
          },
        },
      },
    },
    // Set with the crop guide above; empty uses the image's own focal point.
    { name: 'photoFocalX', type: 'number', min: 0, max: 100, admin: { hidden: true } },
    { name: 'photoFocalY', type: 'number', min: 0, max: 100, admin: { hidden: true } },
    {
      name: 'sections',
      type: 'array',
      admin: {
        description: 'Ordered sections. Uncheck "visible" to hide one without deleting it.',
        components: { RowLabel: '@/components/admin/LabelRowLabel#LabelRowLabel' },
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'title', type: 'text', required: true, admin: { width: '60%' } },
            {
              name: 'kind',
              type: 'select',
              defaultValue: 'text',
              options: [
                { label: 'Text', value: 'text' },
                { label: 'Experience (from collection)', value: 'experience' },
                { label: 'Education (from collection)', value: 'education' },
                { label: 'Selected projects (featured)', value: 'projects' },
                { label: 'Publications (from collection)', value: 'publications' },
                { label: 'Certifications (from collection)', value: 'certifications' },
                { label: 'Technologies', value: 'technologies' },
              ],
              admin: { width: '25%' },
            },
            { name: 'visible', type: 'checkbox', defaultValue: true, admin: { width: '15%' } },
          ],
        },
        { name: 'body', type: 'richText', admin: { condition: (_, siblingData) => siblingData?.kind === 'text' } },
        {
          name: 'technologyGroups',
          type: 'array',
          admin: { condition: (_, siblingData) => siblingData?.kind === 'technologies' },
          fields: [
            { name: 'label', type: 'text', required: true, admin: { description: 'e.g. Used professionally / Personal projects / Learning' } },
            { name: 'items', type: 'text', required: true, admin: { description: 'Comma separated' } },
          ],
        },
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
  ],
}
