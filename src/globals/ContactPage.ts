import type { GlobalConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { revalidateGlobalPaths } from '@/hooks/revalidate'
import { DEFAULT_CONTACT, DEFAULT_FIELDS } from '@/utilities/contactFields'

/** The Contact page: its wording, whether visitors get a chat, a form or both, and the questions asked. */
export const ContactPage: GlobalConfig = {
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
          defaultValue: 'chat',
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
