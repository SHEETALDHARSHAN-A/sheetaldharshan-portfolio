import type { Field } from 'payload'
import { authenticated } from './authenticated'

/**
 * Makes the named fields readable only by signed-in admins, wherever they sit (rows, collapsibles,
 * groups). For globals that are public because the site shows part of them, like the Contact page:
 * the wording stays public, the alert addresses and templates do not. The site itself reads them
 * on the server, so nothing visible changes.
 */
export function privateFields(fields: Field[], names: string[]): Field[] {
  return fields.map((f) => {
    const named = 'name' in f && names.includes(f.name)
    const next = { ...f } as Field & { fields?: Field[]; access?: Record<string, unknown> }
    if (named) next.access = { ...(next.access ?? {}), read: authenticated }
    if (!named && 'fields' in f && Array.isArray(f.fields)) next.fields = privateFields(f.fields, names)
    return next as Field
  })
}
