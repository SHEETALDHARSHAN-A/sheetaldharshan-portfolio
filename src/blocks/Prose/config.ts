import type { Block } from 'payload'
import { FixedToolbarFeature, HeadingFeature, InlineToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { Code } from '@/blocks/Code/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'

export const Prose: Block = {
  slug: 'prose',
  interfaceName: 'ProseBlock',
  labels: { singular: 'Text', plural: 'Text blocks' },
  fields: [
    { name: 'heading', type: 'text', admin: { description: 'Optional section heading' } },
    {
      name: 'richText',
      type: 'richText',
      required: true,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
    },
  ],
}

export { Code, MediaBlock }
