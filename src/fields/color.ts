import type { TextField } from 'payload'

export const HEX = /^#[0-9a-fA-F]{6}$/

/** A colour as #rrggbb, edited with a picker. Empty keeps the theme default. Anything else is rejected. */
export function colorField(name: string, label: string, description?: string, width?: string): TextField {
  return {
    name,
    type: 'text',
    label,
    validate: (value: string | null | undefined) => (!value || HEX.test(value) ? true : 'Use a colour like #3a3d44, or leave empty for the default.'),
    admin: { components: { Field: '@/components/admin/ColorField#ColorField' }, description, ...(width ? { width } : {}) },
  }
}
