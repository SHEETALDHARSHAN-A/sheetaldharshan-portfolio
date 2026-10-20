import type { CollectionConfig, Field, GlobalConfig } from 'payload'
import { authenticated } from '../access/authenticated'

/**
 * The Field Notes's visitor side: comments (threaded, with likes), reviews (1–5 stars), feedback
 * on selected text, and the likes and channel stars themselves. Everything is created only by the
 * endpoints in src/endpoints/kb.ts, which check and moderate it first; the admin approves, hides or
 * deletes.
 */

const GROUP = 'Field Notes'
const adminOnly = { create: () => false, read: authenticated, update: authenticated, delete: authenticated }

const status: Field = {
  name: 'status',
  type: 'select',
  defaultValue: 'published',
  options: [
    { label: 'Shown', value: 'published' },
    { label: 'Waiting for approval', value: 'pending' },
    { label: 'Hidden', value: 'hidden' },
  ],
  admin: { position: 'sidebar', description: 'Waiting: held by the checks (see Why held). Shown: visible to everyone. Hidden: only here.' },
}
const reason: Field = { name: 'reason', type: 'text', label: 'Why held', admin: { position: 'sidebar', readOnly: true, condition: (d) => Boolean(d?.reason) } }
const visitor: Field = { name: 'visitor', type: 'text', admin: { hidden: true } }
const post: Field = { name: 'post', type: 'relationship', relationTo: 'posts', required: true, admin: { position: 'sidebar' } }

export const KbComments: CollectionConfig = {
  slug: 'kb-comments',
  labels: { singular: 'Comment', plural: 'Comments' },
  admin: {
    group: GROUP,
    useAsTitle: 'body',
    defaultColumns: ['body', 'name', 'status', 'likes', 'post', 'createdAt'],
    description: 'Comments on posts. Clean ones show straight away; anything the checks flag waits here for you. Set Status to Shown, Hidden, or delete.',
    listSearchableFields: ['body', 'name', 'email'],
  },
  access: adminOnly,
  defaultSort: '-createdAt',
  timestamps: true,
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'email', type: 'email', admin: { width: '50%', description: 'Optional, never shown.' } },
      ],
    },
    { name: 'body', type: 'textarea', required: true, label: 'Comment' },
    status,
    reason,
    post,
    { name: 'parent', type: 'relationship', relationTo: 'kb-comments', label: 'Reply to', admin: { position: 'sidebar' } },
    { name: 'likes', type: 'number', defaultValue: 0, admin: { position: 'sidebar', readOnly: true } },
    visitor,
  ],
}

export const KbReviews: CollectionConfig = {
  slug: 'kb-reviews',
  labels: { singular: 'Review', plural: 'Reviews' },
  admin: {
    group: GROUP,
    useAsTitle: 'name',
    defaultColumns: ['name', 'rating', 'review', 'status', 'post', 'createdAt'],
    description: 'Star ratings on posts, with an optional short review. One per visitor per post; rating again updates it.',
  },
  access: adminOnly,
  defaultSort: '-createdAt',
  timestamps: true,
  fields: [
    { name: 'rating', type: 'number', required: true, min: 1, max: 5 },
    { name: 'review', type: 'textarea' },
    { name: 'name', type: 'text' },
    status,
    reason,
    post,
    visitor,
  ],
}

export const KbFeedback: CollectionConfig = {
  slug: 'kb-feedback',
  labels: { singular: 'Feedback', plural: 'Feedback' },
  admin: {
    group: GROUP,
    useAsTitle: 'quote',
    defaultColumns: ['kind', 'quote', 'note', 'handled', 'post', 'createdAt'],
    description: 'Readers select text in a post and tell you it looks wrong, could be simpler, or anything else. Fix it, then tick Handled.',
  },
  access: adminOnly,
  defaultSort: '-createdAt',
  timestamps: true,
  fields: [
    {
      name: 'kind',
      type: 'select',
      required: true,
      options: [
        { label: 'Looks wrong', value: 'wrong' },
        { label: 'Could be simpler', value: 'simpler' },
        { label: 'Other feedback', value: 'other' },
      ],
    },
    { name: 'quote', type: 'textarea', label: 'Selected text' },
    { name: 'note', type: 'textarea', label: 'What they said' },
    { name: 'email', type: 'email', admin: { description: 'Optional: to thank them or ask more.' } },
    { name: 'handled', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    post,
    { name: 'alert', type: 'text', label: 'Email alert', admin: { position: 'sidebar', readOnly: true } },
    visitor,
  ],
}

/** One like (of a comment) or star (of a channel) per visitor; the counts are read from here. */
export const KbVotes: CollectionConfig = {
  slug: 'kb-votes',
  labels: { singular: 'Like or star', plural: 'Likes & stars' },
  admin: { group: GROUP, hidden: true },
  access: adminOnly,
  timestamps: true,
  fields: [
    { name: 'kind', type: 'select', required: true, options: ['like', 'star'], index: true },
    { name: 'target', type: 'text', required: true, index: true },
    { name: 'visitor', type: 'text', required: true, index: true },
  ],
}

export const KbSettings: GlobalConfig = {
  slug: 'kb-settings',
  label: 'Field Notes settings',
  admin: { group: GROUP, description: 'The Field Notes page wording, and what readers can do on posts.' },
  access: { read: () => true, update: authenticated },
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'Field Notes' },
    { name: 'intro', type: 'textarea', defaultValue: 'Notes on what I build and learn: backend systems, AI agents, developer tools and databases. Pick a channel, star the ones you like, and tell me if something could be clearer.' },
    {
      type: 'row',
      fields: [
        { name: 'comments', type: 'checkbox', label: 'Comments', defaultValue: true, admin: { width: '25%' } },
        { name: 'reviews', type: 'checkbox', label: 'Star ratings & reviews', defaultValue: true, admin: { width: '25%' } },
        { name: 'feedback', type: 'checkbox', label: 'Feedback on selected text', defaultValue: true, admin: { width: '25%' } },
        { name: 'notify', type: 'checkbox', label: 'Email me each one', defaultValue: true, admin: { width: '25%', description: 'Sent like Contact alerts (Contact page → Email alerts).' } },
      ],
    },
    {
      name: 'moderation',
      type: 'select',
      defaultValue: 'auto',
      options: [
        { label: 'Show clean comments and reviews straight away; hold anything flagged (recommended)', value: 'auto' },
        { label: 'Hold everything until I approve it', value: 'all' },
      ],
      admin: { description: 'Slurs, threats and abuse are always refused. Swearing, several links, all capitals and spam patterns are held for you.' },
    },
    { name: 'blockedWords', type: 'textarea', label: 'Blocked words', admin: { description: 'Extra words to refuse, one per line or comma-separated. Disguises like f*ck or sh1t are caught too.' } },
  ],
}
