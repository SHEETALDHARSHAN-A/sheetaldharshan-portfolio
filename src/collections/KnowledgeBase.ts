import type { CollectionConfig, Field, GlobalConfig } from 'payload'
import { authenticated } from '../access/authenticated'
import { privateFields } from '../access/privateFields'

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
const reader: Field = { name: 'reader', type: 'relationship', relationTo: 'readers', admin: { position: 'sidebar', readOnly: true } }
const ipHash: Field = { name: 'ipHash', type: 'text', index: true, admin: { hidden: true } }
/** Keyed hash of the writer's address, for rate limits only; the address itself is never stored. */
const blockReader: Field = { name: 'blockReader', type: 'ui', admin: { position: 'sidebar', components: { Field: '@/components/admin/BlockReader#BlockReader' } } }
const post: Field = { name: 'post', type: 'relationship', relationTo: 'posts', required: true, admin: { position: 'sidebar' } }

export const KbComments: CollectionConfig = {
  slug: 'kb-comments',
  labels: { singular: 'Comment', plural: 'Comments' },
  admin: {
    group: GROUP,
    useAsTitle: 'body',
    defaultColumns: ['body', 'name', 'status', 'likes', 'post', 'createdAt'],
    listSearchableFields: ['body', 'name'],
    description: 'Comments on posts, from signed-in readers (with their account) or anonymous. Clean ones show straight away; anything the checks flag waits here. Set Status to Shown or Hidden, or delete.',
  },
  access: adminOnly,
  defaultSort: '-createdAt',
  timestamps: true,
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, admin: { width: '50%', description: 'The reader\'s name when they wrote it.' } },
        { name: 'editedAt', type: 'date', label: 'Edited', admin: { width: '50%', readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
      ],
    },
    { name: 'body', type: 'textarea', required: true, label: 'Comment' },
    { name: 'deleted', type: 'checkbox', defaultValue: false, admin: { description: 'Deleted by its writer; kept as "deleted" because it has replies.' } },
    status,
    reason,
    reader,
    blockReader,
    post,
    { name: 'parent', type: 'relationship', relationTo: 'kb-comments', label: 'Reply to', admin: { position: 'sidebar' } },
    { name: 'likes', type: 'number', defaultValue: 0, admin: { position: 'sidebar', readOnly: true } },
    ipHash,
  ],
}

export const KbReviews: CollectionConfig = {
  slug: 'kb-reviews',
  labels: { singular: 'Review', plural: 'Reviews' },
  admin: {
    group: GROUP,
    useAsTitle: 'name',
    defaultColumns: ['name', 'rating', 'review', 'status', 'post', 'createdAt'],
    description: 'Star ratings on posts, with an optional short review. One per reader per post; rating again updates it.',
  },
  access: adminOnly,
  defaultSort: '-createdAt',
  timestamps: true,
  fields: [
    { name: 'rating', type: 'number', required: true, min: 1, max: 5 },
    { name: 'review', type: 'textarea' },
    { name: 'name', type: 'text' },
    { name: 'editedAt', type: 'date', label: 'Edited', admin: { readOnly: true } },
    status,
    reason,
    reader,
    blockReader,
    post,
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
    reader,
    ipHash,
  ],
}

/** Reports of comments, from anyone. You decide: hide or delete the comment, then mark the report. */
export const KbReports: CollectionConfig = {
  slug: 'kb-reports',
  labels: { singular: 'Report', plural: 'Reports' },
  admin: {
    group: GROUP,
    useAsTitle: 'reason',
    defaultColumns: ['reason', 'note', 'status', 'comment', 'createdAt'],
    description: 'Comments readers reported. Open the comment to hide or delete it, then set this report to Actioned or Dismissed. Signed-in reporters see the status on their page.',
  },
  access: adminOnly,
  defaultSort: '-createdAt',
  timestamps: true,
  fields: [
    {
      name: 'reason',
      type: 'select',
      required: true,
      options: [
        { label: 'Spam or advertising', value: 'spam' },
        { label: 'Abuse or harassment', value: 'abuse' },
        { label: 'Hate or discrimination', value: 'hate' },
        { label: 'False or misleading', value: 'misleading' },
        { label: 'Off-topic', value: 'off-topic' },
        { label: 'Something else', value: 'other' },
      ],
    },
    { name: 'note', type: 'textarea', label: 'What they said' },
    { name: 'quote', type: 'textarea', label: 'The comment when reported', admin: { readOnly: true } },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'open',
      options: [
        { label: 'Open', value: 'open' },
        { label: 'Actioned (comment hidden or deleted)', value: 'actioned' },
        { label: 'Dismissed (comment is fine)', value: 'dismissed' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'comment', type: 'relationship', relationTo: 'kb-comments', admin: { position: 'sidebar' } },
    { name: 'post', type: 'relationship', relationTo: 'posts', admin: { position: 'sidebar' } },
    reader,
    { name: 'reporterKey', type: 'text', admin: { hidden: true } },
    { name: 'alert', type: 'text', label: 'Email alert', admin: { position: 'sidebar', readOnly: true } },
  ],
}

/** One like (of a comment) or star (of a channel) per reader; the counts are read from here. */
export const KbVotes: CollectionConfig = {
  slug: 'kb-votes',
  labels: { singular: 'Like or star', plural: 'Likes & stars' },
  admin: { group: GROUP, hidden: true },
  access: adminOnly,
  timestamps: true,
  fields: [
    { name: 'kind', type: 'select', required: true, options: ['like', 'star'], index: true },
    { name: 'target', type: 'text', required: true, index: true },
    { name: 'reader', type: 'relationship', relationTo: 'readers', required: true, index: true },
  ],
}

/**
 * People who signed in to comment, like, star and rate. They sign in with GitHub or an emailed
 * link; there are no passwords. Blocking stops them posting and hides what they wrote; raising
 * Session version signs them out on every device.
 */
export const Readers: CollectionConfig = {
  slug: 'readers',
  labels: { singular: 'Reader', plural: 'Readers' },
  admin: {
    group: GROUP,
    useAsTitle: 'name',
    defaultColumns: ['name', 'provider', 'email', 'status', 'lastSeenAt', 'createdAt'],
    description: 'Everyone who signed in to Field Notes. Block someone to stop them posting and hide what they wrote.',
    listSearchableFields: ['name', 'email', 'githubLogin'],
  },
  access: adminOnly,
  defaultSort: '-lastSeenAt',
  timestamps: true,
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'email', type: 'email', index: true, admin: { width: '50%', description: 'Never shown publicly.' } },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Blocked', value: 'blocked' },
      ],
      admin: { position: 'sidebar', description: 'Blocked: signed out, cannot post, and their comments and reviews are hidden.' },
    },
    { name: 'blockedReason', type: 'text', label: 'Why blocked', admin: { position: 'sidebar', condition: (d) => d?.status === 'blocked', description: 'Only for you.' } },
    { name: 'sessionVersion', type: 'number', defaultValue: 1, label: 'Session version', admin: { position: 'sidebar', description: 'Raise by 1 to sign them out on every device.' } },
    { name: 'lastSeenAt', type: 'date', label: 'Last seen', admin: { position: 'sidebar', readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
    {
      type: 'row',
      fields: [
        { name: 'provider', type: 'select', options: ['github', 'google', 'email'], admin: { width: '33%', readOnly: true } },
        { name: 'githubLogin', type: 'text', label: 'GitHub', admin: { width: '33%', readOnly: true } },
        { name: 'providerId', type: 'text', index: true, admin: { width: '34%', readOnly: true } },
      ],
    },
    { name: 'avatar', type: 'text', admin: { readOnly: true } },
  ],
}

/** Emailed sign-in links: only a hash of the token is kept, each works once for 15 minutes. */
export const ReaderLinks: CollectionConfig = {
  slug: 'reader-links',
  admin: { group: GROUP, hidden: true },
  access: adminOnly,
  timestamps: true,
  fields: [
    { name: 'tokenHash', type: 'text', required: true, index: true },
    { name: 'email', type: 'email', required: true },
    { name: 'name', type: 'text' },
    { name: 'next', type: 'text' },
    { name: 'expiresAt', type: 'date', required: true },
    { name: 'usedAt', type: 'date' },
    ipHash,
  ],
}

const KbSettingsConfig: GlobalConfig = {
  slug: 'kb-settings',
  label: 'Field Notes settings',
  admin: { group: GROUP, description: 'The Field Notes page wording, and what readers can do on posts.' },
  access: { read: () => true, update: authenticated },
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'Field Notes' },
    { name: 'intro', type: 'textarea', defaultValue: 'Notes on what I build and learn: backend systems, AI agents, developer tools and databases. Pick a channel, star the ones you like, and tell me if something could be clearer.' },
    {
      type: 'collapsible',
      label: 'What readers can do (every post)',
      admin: { description: 'Site-wide switches. Each post can override these in its sidebar (Reader interaction).' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'comments', type: 'checkbox', label: 'Comments', defaultValue: true, admin: { width: '33%' } },
            { name: 'anonymous', type: 'checkbox', label: 'Anonymous comments', defaultValue: true, admin: { width: '33%', description: 'Off: readers must sign in to comment.' } },
            { name: 'likes', type: 'checkbox', label: 'Likes on comments', defaultValue: true, admin: { width: '34%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'reviews', type: 'checkbox', label: 'Star ratings & reviews', defaultValue: true, admin: { width: '33%' } },
            { name: 'stars', type: 'checkbox', label: 'Starring channels', defaultValue: true, admin: { width: '33%' } },
            { name: 'reports', type: 'checkbox', label: 'Reporting comments', defaultValue: true, admin: { width: '34%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'feedback', type: 'checkbox', label: 'Feedback on selected text', defaultValue: true, admin: { width: '33%' } },
            { name: 'signIn', type: 'checkbox', label: 'Reader sign-in', defaultValue: true, admin: { width: '33%', description: 'Off: nobody can sign in; likes, stars and ratings stop.' } },
            { name: 'notify', type: 'checkbox', label: 'Email me each one', defaultValue: true, admin: { width: '34%', description: 'Sent like Contact alerts (Contact page → Email alerts).' } },
          ],
        },
      ],
    },
    {
      name: 'moderation',
      type: 'select',
      defaultValue: 'auto',
      options: [
        { label: 'Show clean comments and reviews straight away; hold anything flagged (recommended)', value: 'auto' },
        { label: 'Hold anonymous comments for approval; signed-in readers as above', value: 'anonymous' },
        { label: 'Hold everything until I approve it', value: 'all' },
      ],
      admin: { description: 'Slurs, threats and abuse are always refused. Swearing, several links, all capitals and spam patterns are held for you.' },
    },
    { name: 'blockedWords', type: 'textarea', label: 'Blocked words', admin: { description: 'Extra words to refuse, one per line or comma-separated. Disguises like f*ck or sh1t are caught too.' } },
  ],
}

/** The switches are public (the pages need them); moderation details and alerts are not. */
export const KbSettings: GlobalConfig = { ...KbSettingsConfig, fields: privateFields(KbSettingsConfig.fields, ['notify', 'moderation', 'blockedWords']) }
