'use client'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

type Row = { label?: string; title?: string; name?: string; href?: string }

export const LabelRowLabel: React.FC<RowLabelProps> = () => {
  const { data, rowNumber } = useRowLabel<Row>()
  const index = rowNumber !== undefined ? rowNumber + 1 : ''
  const label = data?.label ?? data?.title ?? data?.name ?? data?.href ?? 'Row'
  return <div>{`${index}. ${label}`}</div>
}
