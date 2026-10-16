import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'
import { MetaDescriptionField, MetaImageField, MetaTitleField, OverviewField, PreviewField } from '@payloadcms/plugin-seo/fields'

import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { Code } from '@/blocks/Code/config'
import { Embed } from '@/blocks/Embed/config'
import { Features } from '@/blocks/Features/config'
import { Gallery } from '@/blocks/Gallery/config'
import { Links } from '@/blocks/Links/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { Prose } from '@/blocks/Prose/config'
import { Stats } from '@/blocks/Stats/config'
import { Timeline } from '@/blocks/Timeline/config'
import { revalidateProject, revalidateProjectDelete } from '@/hooks/revalidate'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'

export const Projects: CollectionConfig<'projects'> = {
  slug: 'projects',
  access: { create: authenticated, delete: authenticated, read: authenticatedOrPublished, update: authenticated },
  defaultPopulate: { title: true, slug: true, summary: true, thumbnail: true, accent: true, kind: true },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'kind', 'featured', 'displayOrder', '_status', 'updatedAt'],
    livePreview: { url: ({ data, req }) => generatePreviewPath({ slug: data?.slug, collection: 'projects', req }) },
    preview: (data, { req }) => generatePreviewPath({ slug: data?.slug as string, collection: 'projects', req }),
    description: 'Publish to show a project on /projects. Only reviewed, public information.',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Overview',
          fields: [
            { name: 'summary', type: 'textarea', required: true, admin: { description: 'One or two sentences. Shown in the explorer and cards.' } },
            { name: 'description', type: 'textarea', admin: { description: 'Short intro paragraph at the top of the project page.' } },
            {
              type: 'row',
              fields: [
                {
                  name: 'kind',
                  type: 'select',
                  defaultValue: 'personal',
                  options: [
                    { label: 'Personal project', value: 'personal' },
                    { label: 'Open-source contribution', value: 'contribution' },
                    { label: 'Professional', value: 'professional' },
                    { label: 'Academic', value: 'academic' },
                    { label: 'Experiment', value: 'experiment' },
                  ],
                  admin: { width: '34%' },
                },
                { name: 'category', type: 'text', admin: { width: '33%', description: 'Shown as the eyebrow, e.g. "Desktop app"' } },
                { name: 'year', type: 'text', admin: { width: '33%', description: 'e.g. 2026 or 2025 to present' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'role', type: 'text', admin: { width: '50%', description: 'e.g. Sole author, Co-built with one other engineer' } },
                { name: 'client', type: 'text', admin: { width: '50%', description: 'Organisation, if any' } },
              ],
            },
            { name: 'technologies', type: 'array', fields: [{ name: 'name', type: 'text', required: true }], admin: { components: { RowLabel: '@/components/admin/LabelRowLabel#LabelRowLabel' } } },
            { name: 'tags', type: 'array', fields: [{ name: 'name', type: 'text', required: true }], admin: { components: { RowLabel: '@/components/admin/LabelRowLabel#LabelRowLabel' } } },
            {
              type: 'row',
              fields: [
                { name: 'startDate', type: 'date', admin: { width: '50%', date: { pickerAppearance: 'monthOnly', displayFormat: 'MMM yyyy' } } },
                { name: 'completionDate', type: 'date', admin: { width: '50%', date: { pickerAppearance: 'monthOnly', displayFormat: 'MMM yyyy' } } },
              ],
            },
          ],
        },
        {
          label: 'Media',
          fields: [
            { name: 'thumbnail', type: 'upload', relationTo: 'media', admin: { description: 'Square-ish image for the project list.' } },
            { name: 'heroImage', type: 'upload', relationTo: 'media', admin: { description: 'Large visual on the explorer stage and the top of the project page.' } },
            { name: 'heroVideo', type: 'upload', relationTo: 'media', admin: { description: 'Optional short, silent MP4 or WebM loop. Keep under 8 MB.' } },
            {
              name: 'screenshots',
              type: 'array',
              fields: [
                { name: 'media', type: 'upload', relationTo: 'media', required: true },
                { name: 'caption', type: 'text' },
              ],
            },
            { name: 'demoVideoUrl', type: 'text', admin: { description: 'The film shown in a pop-up player: a YouTube or Vimeo link, or a direct MP4 link from Media.' } },
          ],
        },
        {
          label: 'Page',
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: [Prose, MediaBlock, Gallery, Code, Features, Timeline, Links, Stats, Embed],
              admin: { initCollapsed: true, description: 'Add, reorder and remove blocks. The page renders them in order under the hero.' },
            },
            {
              name: 'layoutPreset',
              type: 'select',
              defaultValue: 'case-study',
              options: [
                { label: 'Case study (info column + media column)', value: 'case-study' },
                { label: 'Article (single column)', value: 'article' },
              ],
            },
          ],
        },
        {
          label: 'Links',
          fields: [
            { name: 'githubUrl', type: 'text' },
            { name: 'liveDemoUrl', type: 'text' },
            { name: 'documentationUrl', type: 'text' },
            { name: 'releasesUrl', type: 'text' },
          ],
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({ titlePath: 'meta.title', descriptionPath: 'meta.description', imagePath: 'meta.image' }),
            MetaTitleField({ hasGenerateFn: true }),
            MetaImageField({ relationTo: 'media' }),
            MetaDescriptionField({}),
            PreviewField({ hasGenerateFn: true, titlePath: 'meta.title', descriptionPath: 'meta.description' }),
          ],
        },
      ],
    },
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    { name: 'archived', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar', description: 'Hide from the public site without deleting.' } },
    { name: 'displayOrder', type: 'number', defaultValue: 0, admin: { position: 'sidebar', description: 'Lower numbers first.' } },
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
      admin: { position: 'sidebar', description: 'Stage background tint when no hero media is set.' },
    },
    slugField(),
  ],
  hooks: { afterChange: [revalidateProject], afterDelete: [revalidateProjectDelete] },
  versions: { drafts: { autosave: { interval: 200 }, schedulePublish: true }, maxPerDoc: 30 },
}
