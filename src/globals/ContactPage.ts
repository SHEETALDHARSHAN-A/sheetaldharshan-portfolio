import { privateFields } from '@/access/privateFields'
import type { GlobalConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { revalidateGlobalPaths } from '@/hooks/revalidate'
import type { Field } from 'payload'
import { DEFAULT_CONTACT, DEFAULT_FIELDS } from '@/utilities/contactFields'
import { DEFAULT_ACCENT, DEFAULT_ALERT, DEFAULT_CONFIRM, DEFAULT_FROM_NAME, type EmailTemplate } from '@/utilities/emailTemplate'

const PLACEHOLDERS = '{name}, {first}, {email}, {topic}, {site} and {url} are filled in.'

/** The fields of one email; the alert and the "thanks" email share them. */
const templateFields = (d: EmailTemplate, kind: 'alert' | 'confirm', buttonNote: string): Field[] => [
  { name: 'subject', type: 'text', defaultValue: d.subject, admin: { description: `${PLACEHOLDERS} An empty placeholder's separator is dropped, e.g. "· {topic}".` } },
  { name: 'heading', type: 'text', defaultValue: d.heading },
  { name: 'intro', type: 'textarea', defaultValue: d.intro, admin: { description: 'A blank line starts a new paragraph.' } },
  {
    type: 'row',
    fields: [
      { name: 'showAnswers', type: 'checkbox', label: 'List every answer', defaultValue: d.showAnswers, admin: { width: '40%' } },
      { name: 'button', type: 'text', defaultValue: d.button, admin: { width: '60%', description: `${buttonNote} Empty hides it.` } },
    ],
  },
  { name: 'footer', type: 'textarea', defaultValue: d.footer },
  { name: 'preview', type: 'ui', admin: { components: { Field: { path: '@/components/admin/EmailPreview#EmailPreview', clientProps: { kind } } } } },
]

/** The Contact page: its wording, whether visitors get a chat, a form or both, and the questions asked. */
const ContactPageConfig: GlobalConfig = {
  slug: 'contact-page',
  label: 'Contact page',
  admin: {
    group: 'Contact page',
    description: 'What the Contact page says and asks. The chat and the form use the same fields; add, remove or reorder them below. Messages arrive in Contact page → Messages.',
  },
  access: { read: () => true, update: authenticated },
  hooks: { afterChange: [revalidateGlobalPaths(['/contact'])] },
  fields: [
    { name: 'heading', type: 'text', defaultValue: DEFAULT_CONTACT.heading },
    { name: 'intro', type: 'textarea', defaultValue: DEFAULT_CONTACT.intro },
    {
      type: 'row',
      fields: [
        {
          name: 'mode',
          type: 'select',
          label: 'Visitors write with',
          defaultValue: 'both',
          options: [
            { label: 'Chat and form (a switch)', value: 'both' },
            { label: 'Chat only', value: 'chat' },
            { label: 'Form only', value: 'form' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'firstMode',
          type: 'select',
          label: 'Opens first',
          defaultValue: 'form',
          options: [
            { label: 'Chat', value: 'chat' },
            { label: 'Form', value: 'form' },
          ],
          admin: { width: '50%', condition: (_, s) => s?.mode === 'both', description: "A visitor's own choice is remembered after that." },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Chat wording',
      fields: [
        { name: 'greeting', type: 'text', defaultValue: DEFAULT_CONTACT.greeting, admin: { description: 'The first bubble, before the first question.' } },
        { name: 'doneMessage', type: 'text', defaultValue: DEFAULT_CONTACT.doneMessage, admin: { description: 'After sending. {first}, {name} and {email} are filled in.' } },
        { name: 'formNote', type: 'text', label: 'Note under the form button', defaultValue: DEFAULT_CONTACT.formNote },
      ],
    },
    {
      type: 'collapsible',
      label: 'Email alerts',
      fields: [
        { name: 'emailAlertStatus', type: 'ui', admin: { components: { Field: '@/components/admin/EmailAlertStatus#EmailAlertStatus' } } },
        {
          type: 'row',
          fields: [
            { name: 'notify', type: 'checkbox', label: 'Email me each new message', defaultValue: true, admin: { width: '40%' } },
            {
              name: 'notifyEmail',
              type: 'email',
              label: 'Send alerts to',
              admin: { width: '60%', description: 'Empty: the email in Site-wide → Name & profiles. The test buttons use what is typed here, saved or not.' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'fromName', type: 'text', label: 'Sender name', defaultValue: DEFAULT_FROM_NAME, admin: { width: '40%', description: 'Shown in the inbox. {site} is your name.' } },
            {
              name: 'fromEmail',
              type: 'email',
              label: 'Sender address',
              admin: { width: '40%', placeholder: 'contact@yourdomain.com', description: 'On a domain verified in Resend. No mailbox needed: replies go to the visitor. Empty: CONTACT_FROM_EMAIL.' },
            },
            { name: 'emailAccent', type: 'text', label: 'Accent colour', defaultValue: DEFAULT_ACCENT, admin: { width: '20%', placeholder: 'Theme accent', description: 'Optional, e.g. #3d8bff. Empty: the site theme. Emails use the theme colours (Site-wide → Theme).' } },
          ],
        },
        {
          name: 'alertEmail',
          type: 'group',
          label: 'Alert email (to you)',
          admin: { description: 'Sent to you for each message. Replying answers the visitor.' },
          fields: templateFields(DEFAULT_ALERT, 'alert', 'Opens a reply to the visitor.'),
        },
        { name: 'confirm', type: 'checkbox', label: 'Also send the visitor a "thanks" email', defaultValue: false, admin: { description: 'A copy of their message, so they know it arrived. Replies to it come to you.' } },
        {
          name: 'confirmEmail',
          type: 'group',
          label: '"Thanks" email (to the visitor)',
          admin: { condition: (_, s) => Boolean(s?.confirm) },
          fields: templateFields(DEFAULT_CONFIRM, 'confirm', 'Opens your site.'),
        },
      ],
    },
    {
      name: 'fields',
      type: 'array',
      label: 'Questions',
      labels: { singular: 'Question', plural: 'Questions' },
      admin: {
        initCollapsed: true,
        components: { RowLabel: '@/components/admin/ContactFieldLabel#ContactFieldLabel' },
        description: 'Asked in this order. Keep one name, one required email and one long message field; without them the defaults are used.',
      },
      defaultValue: DEFAULT_FIELDS.map((f) => ({ ...f, options: f.options.map((label) => ({ label })) })),
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', required: true, admin: { width: '40%', description: 'Shown on the form.' } },
            {
              name: 'type',
              type: 'select',
              required: true,
              defaultValue: 'text',
              options: [
                { label: 'Name', value: 'name' },
                { label: 'Email', value: 'email' },
                { label: 'Phone', value: 'phone' },
                { label: 'Short text', value: 'text' },
                { label: 'Long text (message)', value: 'textarea' },
                { label: 'Choice (buttons)', value: 'choice' },
              ],
              admin: { width: '30%' },
            },
            { name: 'key', type: 'text', required: true, admin: { width: '30%', description: 'A short id, e.g. company. Letters, numbers, _.' } },
          ],
        },
        { name: 'question', type: 'text', required: true, admin: { description: 'What the chat asks.' } },
        {
          type: 'row',
          fields: [
            { name: 'required', type: 'checkbox', defaultValue: true, admin: { width: '30%', description: 'Optional questions can be skipped ("skip" in the chat).' } },
            { name: 'placeholder', type: 'text', admin: { width: '70%' } },
          ],
        },
        {
          name: 'options',
          type: 'array',
          labels: { singular: 'Option', plural: 'Options' },
          admin: { condition: (_, s) => s?.type === 'choice', description: 'The buttons to pick from.' },
          fields: [{ name: 'label', type: 'text', required: true }],
        },
        {
          type: 'row',
          fields: [
            { name: 'retry', type: 'text', label: 'If the answer does not fit', admin: { width: '50%', description: 'What the chat says before asking again.' } },
            { name: 'reply', type: 'text', label: 'Reply after a good answer', admin: { width: '50%', description: 'Optional. {first} and {answer} are filled in.' } },
          ],
        },
      ],
    },
  ],
}

export const ContactPage: GlobalConfig = { ...ContactPageConfig, fields: privateFields(ContactPageConfig.fields, ['notify', 'notifyEmail', 'fromName', 'fromEmail', 'emailAccent', 'alertEmail', 'confirm', 'confirmEmail']) }
