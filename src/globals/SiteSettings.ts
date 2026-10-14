import type { GlobalConfig } from 'payload'
import { authenticated } from '@/access/authenticated'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: { read: () => true, update: authenticated },
  fields: [
    { name: 'displayName', type: 'text', defaultValue: 'Sheetaldharshan' },
    { name: 'canonicalUrl', type: 'text', defaultValue: 'https://sheetaldharshan.me' },
    { name: 'description', type: 'textarea', defaultValue: 'Developer tools and AI agents that work over real databases.' },
    { name: 'linkedinUrl', type: 'text', defaultValue: 'https://www.linkedin.com/in/sheetaldharshan' },
    { name: 'githubUrl', type: 'text', defaultValue: 'https://github.com/SHEETALDHARSHAN-A' },
    { name: 'contactFormEnabled', type: 'checkbox', defaultValue: false },
  ],
}
