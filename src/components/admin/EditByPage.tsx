import type { Payload } from 'payload'

import { EditByPageTree, type Branch, type Leaf } from './EditByPageTree'

const g = (slug: string) => `/admin/globals/${slug}`
const c = (slug: string) => `/admin/collections/${slug}`

/**
 * "Edit by page": the admin menu in the site's own order, each page with everything that shapes it.
 * Projects are listed one by one under the Projects page.
 */
export async function EditByPage({ payload }: { payload: Payload }) {
  const projects = await payload
    .find({ collection: 'projects', depth: 0, limit: 50, sort: 'displayOrder', draft: true, overrideAccess: true, select: { title: true } as never })
    .catch(() => null)
  const tree: Branch[] = [
    { label: 'Site-wide', items: [{ label: 'Theme: colours, fonts, shape', href: g('appearance') }, { label: 'Name & profiles', href: g('site-settings') }, { label: 'Favicon & icons', href: g('brand') }] },
    { label: 'Sidebar', items: [{ label: 'Menu links & sidebar look', href: g('navigation') }, { label: 'Pet', href: g('pet') }, { label: 'Coding activity', href: g('coding-activity') }] },
    { label: 'Homepage', view: '/', items: [{ label: 'Conversation & its colours', href: g('homepage') }] },
    {
      label: 'Projects page',
      view: '/projects',
      items: [
        { label: 'Page settings: colours & animation', href: g('projects-page') },
        { label: 'All projects', href: c('projects') },
        ...((projects?.docs ?? []) as unknown as { id: number; title: string }[]).map((p) => ({ label: `↳ ${p.title}`, href: `${c('projects')}/${p.id}` })),
        { label: '+ New project', href: `${c('projects')}/create` },
      ],
    },
    {
      label: './stdout',
      view: '/notes',
      items: [
        { label: 'Posts', href: c('posts') },
        { label: 'Channels', href: c('categories') },
        { label: 'Comments', href: c('kb-comments') },
        { label: 'Reported comments', href: c('kb-reports') },
        { label: 'Reviews', href: c('kb-reviews') },
        { label: 'Feedback on posts', href: c('kb-feedback') },
        { label: 'Readers (block, sign out)', href: c('readers') },
        { label: 'Settings: switches & moderation', href: g('kb-settings') },
      ],
    },
    {
      label: 'About page',
      view: '/about',
      items: [
        { label: 'Photo, intro & sections', href: g('about') },
        { label: 'Experience', href: c('experience') },
        { label: 'Education', href: c('education') },
        { label: 'Certifications', href: c('certifications') },
      ],
    },
    { label: 'Research page', view: '/research', items: [{ label: 'Publications', href: c('publications') }] },
    { label: 'Contact page', view: '/contact', items: [{ label: 'Messages from the form', href: c('messages') }, { label: 'Chat, form & questions', href: g('contact-page') }, { label: 'Email & profiles', href: g('site-settings') }] },
    { label: 'Library', items: [{ label: 'Images, videos & files', href: c('media') }] },
    {
      label: 'Admin panel',
      items: [
        { label: 'Logo, colours & font', href: g('admin-look') },
        { label: 'Your account, photo & theme', href: '/admin/account' },
        { label: 'Sign-in & security (2FA)', href: g('admin-security') },
        { label: 'Admin users', href: c('users') },
        { label: 'Import & export (site.json)', href: '/admin/site-data' },
      ],
    },
  ]
  // Anything added to the CMS later and not placed above still gets a link, under "More".
  const listed = new Set(tree.flatMap((b) => b.items.map((i) => i.href)))
  const more: Leaf[] = [
    ...payload.config.globals.filter((x) => x.admin?.hidden !== true).map((x) => ({ label: typeof x.label === 'string' ? x.label : x.slug, href: g(x.slug) })),
    ...payload.config.collections
      .filter((x) => x.admin?.hidden !== true && !x.slug.startsWith('payload-'))
      .map((x) => ({ label: typeof x.labels?.plural === 'string' ? x.labels.plural : x.slug, href: c(x.slug) })),
  ].filter((l) => !listed.has(l.href))
  if (more.length) tree.push({ label: 'More', items: more })

  return <EditByPageTree tree={tree} />
}
