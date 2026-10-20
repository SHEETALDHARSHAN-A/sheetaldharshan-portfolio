/**
 * What readers may do on Field Notes: the site-wide switches (Field Notes → Settings) combined with
 * a post's own overrides (its "Reader interaction" sidebar). The server enforces these; the pages
 * use the same answer to show or hide buttons.
 */
export type SiteRules = { comments: boolean; anonymous: boolean; likes: boolean; reviews: boolean; stars: boolean; reports: boolean; feedback: boolean; signIn: boolean; notify: boolean; moderation: 'auto' | 'anonymous' | 'all'; blocked: string[] }
export type PostRules = { comments: 'on' | 'locked' | 'off'; anonymous: boolean; likes: boolean; ratings: boolean; feedback: boolean; reports: boolean; signIn: boolean }
type Override = 'default' | 'on' | 'off' | 'locked' | null | undefined

export function siteRules(g: Record<string, unknown> | null | undefined): SiteRules {
  const on = (k: string) => g?.[k] !== false
  return {
    comments: on('comments'),
    anonymous: on('anonymous'),
    likes: on('likes'),
    reviews: on('reviews'),
    stars: on('stars'),
    reports: on('reports'),
    feedback: on('feedback'),
    signIn: on('signIn'),
    notify: on('notify'),
    moderation: g?.moderation === 'all' ? 'all' : g?.moderation === 'anonymous' ? 'anonymous' : 'auto',
    blocked: String(g?.blockedWords ?? '').split(/[\n,]+/).map((w) => w.trim()).filter(Boolean),
  }
}

const pick = (o: Override, site: boolean) => (o === 'on' ? true : o === 'off' ? false : site)

export function postRules(site: SiteRules, interaction: Record<string, Override> | null | undefined): PostRules {
  const i = interaction ?? {}
  const c = i.comments
  return {
    comments: c === 'off' ? 'off' : c === 'locked' ? 'locked' : c === 'on' || site.comments ? 'on' : 'off',
    anonymous: site.anonymous,
    likes: site.signIn && pick(i.likes, site.likes),
    ratings: site.signIn && pick(i.ratings, site.reviews),
    feedback: pick(i.feedback, site.feedback),
    reports: site.reports,
    signIn: site.signIn,
  }
}
