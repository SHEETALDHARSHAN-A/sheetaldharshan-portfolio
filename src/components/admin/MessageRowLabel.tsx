'use client'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

type MessageRow = { content?: string; enabled?: boolean; choices?: unknown[] }

export const MessageRowLabel: React.FC<RowLabelProps> = () => {
  const { data, rowNumber } = useRowLabel<MessageRow>()
  const index = rowNumber !== undefined ? rowNumber + 1 : ''
  const text = (data?.content ?? '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  const preview = text.length > 48 ? `${text.slice(0, 48)}…` : text
  const flags = [data?.enabled === false ? 'hidden' : null, data?.choices?.length ? 'with choices' : null]
    .filter(Boolean)
    .join(', ')
  return <div>{`${index}. ${preview || 'New message'}${flags ? ` (${flags})` : ''}`}</div>
}
