import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'

type LayoutBlock = NonNullable<Page['layout']>[number]

/** Renders the template-era layout blocks (content, cta, form, media). Project-style blocks are handled by RenderProjectBlocks. */
export const RenderBlocks: React.FC<{ blocks: LayoutBlock[] }> = ({ blocks }) => {
  if (!Array.isArray(blocks) || blocks.length === 0) return null
  return (
    <Fragment>
      {blocks.map((block, index) => {
        const key = block.id ?? `${block.blockType}-${index}`
        switch (block.blockType) {
          case 'content':
            return <div className="my-16" key={key}><ContentBlock {...block} /></div>
          case 'cta':
            return <div className="my-16" key={key}><CallToActionBlock {...block} /></div>
          case 'formBlock':
            return <div className="my-16" key={key}><FormBlock {...(block as unknown as Parameters<typeof FormBlock>[0])} /></div>
          case 'mediaBlock':
            return <div className="my-16" key={key}><MediaBlock {...block} disableInnerContainer /></div>
          default:
            return null
        }
      })}
    </Fragment>
  )
}
