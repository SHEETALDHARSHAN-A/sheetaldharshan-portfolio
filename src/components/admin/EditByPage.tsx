import Link from 'next/link'
import type { Payload } from 'payload'

type Leaf = { label: string; href: string }
type Branch = { label: string; view?: string; items: Leaf[] }

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
    { label: 'Sidebar', items: [{ label: 'Menu links', href: g('navigation') }, { label: 'Pet', href: g('pet') }, { label: 'Coding activity', href: g('coding-activity') }] },
    { label: 'Homepage', view: '/', items: [{ label: 'Conversation', href: g('homepage') }] },
    {
      label: 'Projects page',
      view: '/projects',
      items: [
        { label: 'All projects', href: c('projects') },
        ...((projects?.docs ?? []) as unknown as { id: number; title: string }[]).map((p) => ({ label: `↳ ${p.title}`, href: `${c('projects')}/${p.id}` })),
        { label: '+ New project', href: `${c('projects')}/create` },
      ],
    },
    { label: 'Writing page', view: '/blog', items: [{ label: 'Posts', href: c('posts') }, { label: 'Categories', href: c('categories') }] },
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
    { label: 'Contact page', view: '/contact', items: [{ label: 'Email & profiles', href: g('site-settings') }] },
    { label: 'Library', items: [{ label: 'Images, videos & files', href: c('media') }, { label: 'Admin users', href: c('users') }] },
  ]

  return (
    <nav className="edit-by-page" aria-label="Edit by page">
      <style>{`
        .edit-by-page { margin: 0 0 18px; padding-bottom: 14px; border-bottom: 1px solid var(--theme-elevation-100); }
        .edit-by-page > p { margin: 0 0 8px; font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--theme-elevation-500); }
        .edit-by-page details { margin: 0 0 2px; }
        .edit-by-page summary { display: flex; align-items: center; gap: 6px; padding: 5px 0; cursor: pointer; font-weight: 600; color: var(--theme-elevation-800); list-style: none; }
        .edit-by-page summary::-webkit-details-marker { display: none; }
        .edit-by-page summary::before { content: '▸'; font-size: 10px; color: var(--theme-elevation-400); transition: transform .15s ease; }
        .edit-by-page details[open] > summary::before { transform: rotate(90deg); }
        .edit-by-page summary a.view { margin-left: auto; font-size: 11px; font-weight: 400; color: var(--theme-elevation-500); text-decoration: none; }
        .edit-by-page summary a.view:hover { color: var(--theme-success-500, #3d8bff); }
        .edit-by-page ul { list-style: none; margin: 0 0 6px; padding: 0 0 0 14px; border-left: 1px solid var(--theme-elevation-100); }
        .edit-by-page li a { display: block; padding: 3px 0 3px 8px; font-size: 13px; color: var(--theme-elevation-650); text-decoration: none; border-radius: 4px; }
        .edit-by-page li a:hover { color: var(--theme-elevation-1000); background: var(--theme-elevation-50); }
      `}</style>
      <p>Edit by page</p>
      {tree.map((b, i) => (
        <details key={b.label} open={i < 4}>
          <summary>
            {b.label}
            {b.view ? (
              <a className="view" href={b.view} target="_blank" rel="noreferrer" title={`Open ${b.view} on the site`}>
                view ↗
              </a>
            ) : null}
          </summary>
          <ul>
            {b.items.map((it) => (
              <li key={it.href + it.label}>
                <Link href={it.href}>{it.label}</Link>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </nav>
  )
}
