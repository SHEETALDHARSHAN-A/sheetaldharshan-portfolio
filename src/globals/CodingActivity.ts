import type { Field, GlobalConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { revalidateGlobalPaths } from '@/hooks/revalidate'

const accounts = (name: string, description: string): Field => ({
  name,
  type: 'array',
  labels: { singular: 'Account', plural: 'Accounts' },
  admin: { description, initCollapsed: false },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'username', type: 'text', required: true, admin: { width: '70%' } },
        { name: 'enabled', type: 'checkbox', defaultValue: true, label: 'Include', admin: { width: '30%' } },
      ],
    },
  ],
})

/**
 * Optional sidebar cards: a GitHub contribution heatmap and LeetCode progress. Each can be turned
 * off, and each takes several accounts whose numbers are added together. The pet shrinks to fit.
 */
export const CodingActivity: GlobalConfig = {
  slug: 'coding-activity',
  label: 'Coding activity',
  access: { read: () => true, update: authenticated },
  hooks: { afterChange: [revalidateGlobalPaths(['/projects', '/blog', '/about', '/contact', '/research'])] },
  admin: { description: 'Choose where each card appears: the sidebar (under the pet, which resizes to fit) and/or the About page (under the photo). Untick both to hide a card.' },
  fields: [
    {
      type: 'collapsible',
      label: 'GitHub activity',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'githubInSidebar', type: 'checkbox', defaultValue: true, label: 'Show in the sidebar', admin: { width: '50%' } },
            { name: 'githubOnAbout', type: 'checkbox', defaultValue: true, label: 'Show on the About page', admin: { width: '50%' } },
          ],
        },
        accounts('githubAccounts', 'Contributions from every included account are added together, day by day. Private work only counts if "Private contributions" is turned on in that GitHub profile.'),
      ],
    },
    {
      type: 'collapsible',
      label: 'LeetCode',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'leetcodeInSidebar', type: 'checkbox', defaultValue: false, label: 'Show in the sidebar', admin: { width: '50%' } },
            { name: 'leetcodeOnAbout', type: 'checkbox', defaultValue: true, label: 'Show on the About page', admin: { width: '50%' } },
          ],
        },
        accounts('leetcodeAccounts', 'Solved counts from every included account are added together.'),
      ],
    },
  ],
}
