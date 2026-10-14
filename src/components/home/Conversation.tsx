import { Fragment } from 'react'
import { ConversationPlayer } from '@/components/home/ConversationPlayer'
import { InlineText } from '@/components/home/InlineText'
import { ChoiceInline } from '@/components/home/ChoiceLink'
import type { Conversation as ConversationData } from '@/data/types'

const plainLength = (text: string) => text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').length

/**
 * Homepage conversation. Server-rendered bubbles in the reference structure
 * (bubble > loading dots + message, followed by a line break). The client player
 * reveals them one by one; without JavaScript every bubble is simply visible.
 */
export function Conversation({ data }: { data: ConversationData }) {
  const bubbles: { id: string; length: number; node: React.ReactNode; typing?: number }[] = []
  for (const message of data.messages) {
    bubbles.push({ id: message.id, length: plainLength(message.content), node: <InlineText text={message.content} />, typing: message.revealDelay || undefined })
    if (message.choices.length > 0) {
      bubbles.push({ id: `${message.id}-choices`, length: message.choices.reduce((n, c) => n + c.label.length + 2, 0), node: <ChoiceInline choices={message.choices} /> })
    }
  }

  return (
    <div className="jg-messages" data-preset={data.animationPreset} data-typing={data.typingIndicator}>
      {bubbles.map((bubble) => (
        <Fragment key={bubble.id}>
          <div className="jg-bubble jg-left" data-length={bubble.length} data-typing-ms={bubble.typing ?? ''}>
            <span className="jg-loading" aria-hidden="true">
              <b>•</b>
              <b>•</b>
              <b>•</b>
            </span>
            <span className="jg-message">{bubble.node}</span>
          </div>
          <br />
        </Fragment>
      ))}
      <ConversationPlayer preset={data.animationPreset} typing={data.typingIndicator} startDelay={data.startDelay} />
    </div>
  )
}
