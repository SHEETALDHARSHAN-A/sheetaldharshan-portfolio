import type { GlobalConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { revalidateGlobalPaths } from '@/hooks/revalidate'
import { currentImages } from '@/fields/currentImages'
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
    { name: 'photo', type: 'upload', relationTo: 'media', admin: { description: 'Optional. A placeholder is shown until a photo is uploaded.' } },
    currentImages('photoInUse', [{ label: 'About photo', watch: 'photo', fallbackLabel: 'None yet: a “Photo coming soon” placeholder shows' }]),
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
