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
  hooks: { afterChange: [revalidateGlobalPaths(['/projects', '/notes', '/about', '/contact', '/research'])] },
  admin: { group: 'Sidebar', description: 'Choose where each card appears and whether it starts open. Cards show above round logos (a pop-up in the sidebar, in the page on About); with two or more open by default they take turns as a carousel. Untick both places to hide a card.' },
  fields: [
    {
      name: 'carouselSeconds',
      type: 'number',
      label: 'Carousel: seconds on each card',
      defaultValue: 10,
      min: 3,
      max: 120,
      admin: { description: 'How long a card stays before the next one slides in, when two or more are open by default.' },
    },
    {
      type: 'collapsible',
      label: 'GitHub activity',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'githubInSidebar', type: 'checkbox', defaultValue: true, label: 'Show in the sidebar', admin: { width: '25%' } },
            { name: 'githubSidebarOpen', type: 'checkbox', defaultValue: true, label: 'Open there by default', admin: { width: '25%' } },
            { name: 'githubOnAbout', type: 'checkbox', defaultValue: true, label: 'Show on the About page', admin: { width: '25%' } },
            { name: 'githubAboutOpen', type: 'checkbox', defaultValue: true, label: 'Open there by default', admin: { width: '25%' } },
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
            { name: 'leetcodeInSidebar', type: 'checkbox', defaultValue: false, label: 'Show in the sidebar', admin: { width: '25%' } },
            { name: 'leetcodeSidebarOpen', type: 'checkbox', defaultValue: false, label: 'Open there by default', admin: { width: '25%' } },
            { name: 'leetcodeOnAbout', type: 'checkbox', defaultValue: true, label: 'Show on the About page', admin: { width: '25%' } },
            { name: 'leetcodeAboutOpen', type: 'checkbox', defaultValue: true, label: 'Open there by default', admin: { width: '25%' } },
          ],
        },
        accounts('leetcodeAccounts', 'Solved counts from every included account are added together.'),
      ],
    },
  ],
}
