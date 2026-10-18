'use client'

import { useRowLabel } from '@payloadcms/ui'

/** Question rows in the admin read as "Your email (email, required)" instead of "Question 02". */
export function ContactFieldLabel() {
  const { data, rowNumber } = useRowLabel<{ label?: string; type?: string; required?: boolean }>()
  return (
    <span>
      {data?.label || `Question ${(rowNumber ?? 0) + 1}`}
      <span style={{ color: 'var(--theme-elevation-500)', marginLeft: 6 }}>
        ({data?.type ?? 'text'}
        {data?.required === false ? ', optional' : ''})
      </span>
    </span>
  )
}
