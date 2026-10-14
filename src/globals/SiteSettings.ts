import type { GlobalConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { revalidateGlobalPaths } from '@/hooks/revalidate'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  access: { read: () => true, update: authenticated },
  hooks: { afterChange: [revalidateGlobalPaths(['/', '/projects', '/blog', '/about', '/contact', '/research'])] },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'displayName', type: 'text', defaultValue: 'Sheetaldharshan', admin: { width: '50%' } },
        { name: 'fullName', type: 'text', defaultValue: 'Sheetaldharshan A', admin: { width: '50%' } },
      ],
    },
    { name: 'tagline', type: 'text', defaultValue: 'I build developer tools and AI agents that work over real databases.' },
    { name: 'description', type: 'textarea', defaultValue: 'Software engineer at Exasol. Developer tools and AI agents that work over real databases.' },
    { name: 'canonicalUrl', type: 'text', defaultValue: 'https://sheetaldharshan.me' },
    { name: 'currentRole', type: 'text', defaultValue: 'Software Engineer at Exasol' },
    { name: 'location', type: 'text', defaultValue: 'Chennai, India' },
    {
      name: 'socialLinks',
      type: 'array',
      admin: { components: { RowLabel: '@/components/admin/LabelRowLabel#LabelRowLabel' } },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', required: true, admin: { width: '40%' } },
            { name: 'href', type: 'text', required: true, admin: { width: '60%' } },
          ],
        },
      ],
    },
    { name: 'email', type: 'email', admin: { description: 'Optional. Shown on the contact page only when set.' } },
    { name: 'contactFormEnabled', type: 'checkbox', defaultValue: false, admin: { description: 'Requires an email provider configured on the server.' } },
    { name: 'resume', type: 'upload', relationTo: 'media', admin: { description: 'PDF shown as a download on the About page.' } },
    { name: 'ogImage', type: 'upload', relationTo: 'media', admin: { description: 'Default social preview image (1200×630).' } },
    { name: 'footerNote', type: 'text', defaultValue: 'Built with Next.js and Payload. Content managed from /admin.' },
  ],
}
