import type { Block } from 'payload'

/** "Before you go on": links to posts or a channel worth reading first. Drop it anywhere in a post. */
export const Prereq: Block = {
  slug: 'prereq',
  labels: { singular: 'Prerequisite', plural: 'Prerequisites' },
  interfaceName: 'PrereqBlock',
  fields: [
    { name: 'title', type: 'text', defaultValue: 'Before you go on', admin: { description: 'Shown above the links, e.g. "Read these first".' } },
    { name: 'posts', type: 'relationship', relationTo: 'posts', hasMany: true },
    { name: 'channel', type: 'relationship', relationTo: 'categories', admin: { description: 'Optional: a whole channel to read first.' } },
    { name: 'note', type: 'text', admin: { description: 'Optional, e.g. "You need to know what MCP is".' } },
  ],
}
