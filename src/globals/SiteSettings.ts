import type { GlobalConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { revalidateGlobalPaths } from '@/hooks/revalidate'
import { currentImages } from '@/fields/currentImages'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Name & profiles',
  admin: { group: 'Site-wide', description: 'The name in the sidebar and page titles, your role, contact email, profile links (sidebar footer and Contact) and the link-preview image.' },
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
    { name: 'resume', type: 'upload', relationTo: 'media', label: 'Résumé (PDF)', admin: { description: 'Shown as a "Download résumé" button on About and Contact. Upload a PDF, or use the link below; leave both empty to hide the button.' } },
    {
      name: 'resumeLink',
      type: 'text',
      label: 'Résumé link',
      admin: {
        description: 'Optional, used instead of the upload: a direct PDF link, e.g. a GitHub release asset (https://github.com/<you>/<repo>/releases/download/<tag>/<file>.pdf). Replace the file on that release to update it; the link stays the same.',
      },
    },
    { name: 'ogImage', type: 'upload', relationTo: 'media', admin: { description: 'Default social preview image (1200×630).' } },
    currentImages('ogImageInUse', [{ label: 'Link preview', watch: 'ogImage', fallback: '/icon-512.png', fallbackLabel: 'Built-in SD logo' }]),
    { name: 'footerNote', type: 'text', defaultValue: 'Built with Next.js and Payload. Content managed from /admin.' },
  ],
}
