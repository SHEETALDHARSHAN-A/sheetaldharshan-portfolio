import type { GlobalConfig } from 'payload'
import { authenticated } from '@/access/authenticated'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  access: { read: () => true, update: authenticated },
  fields: [
    { name: 'messages', type: 'array', fields: [{ name: 'content', type: 'text', required: true }, { name: 'tone', type: 'select', options: ['default', 'muted', 'accent'], defaultValue: 'default' }, { name: 'revealDelay', type: 'number', defaultValue: 800 }, { name: 'enabled', type: 'checkbox', defaultValue: true }] },
    { name: 'introTitle', type: 'text', defaultValue: 'Tools for real data.' },
    { name: 'introNote', type: 'textarea' },
  ],
}
