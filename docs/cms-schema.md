# CMS schema

## Globals
- **Homepage conversation**: `messages[]` (content with `[label](href)` links, style default/accent/muted, optional `revealDelay` ms, enabled, `choices[]` label/href/newTab), `animationPreset` calm/snappy/instant, `typingIndicator` dots/none, `startDelay`, `meta`. Drafts and versions on; live preview at `/`.
- **Navigation**: `items[]` (label, href, visible, newTab) numbered in order; `footerLinks[]`.
- **About**: eyebrow, title, intro (paragraphs separated by a blank line), photo, `sections[]` (title, kind text/experience/education/projects/publications/certifications/technologies, visible, body rich text, technologyGroups), meta. Drafts on; live preview at `/about`.
- **Appearance**: theme, accent, fontPreset, headingScale, spacing, radius, linkStyle, bubbleStyle, animationIntensity, animationSpeed, projectDisplayStyle. All selects.
- **Site settings**: displayName, fullName, tagline, description, canonicalUrl, currentRole, location, socialLinks[], email (optional), contactFormEnabled, resume (upload), ogImage (upload), footerNote.

## Collections
- **Projects** (drafts, autosave, schedule publish, versions): title, slug, summary, description, kind, category, year, role, client, technologies[], tags[], startDate, completionDate; media tab (thumbnail, heroImage, heroVideo, screenshots[], demoVideoUrl); page tab (`layout` blocks: prose, mediaBlock, gallery, code, features, timeline, links, stats, embed; `layoutPreset` case-study/article); links tab (githubUrl, liveDemoUrl, documentationUrl, releasesUrl); SEO tab; sidebar: featured, archived, displayOrder, accent.
- **Posts** (template, drafts): title, heroImage, content (Lexical with headings and the prereq, photo, video, audio, gallery, code, banner and media blocks), relatedPosts, categories (channels), prerequisites, publishedAt, authors, SEO. Routes at `/notes/[slug]`; channels at `/notes/c/[slug]`.
- **Categories** (Field Notes channels): title, emoji, order, description, slug.
- **kb-comments**, **kb-reviews**, **kb-feedback**, **kb-votes** (likes and channel stars), global **kb-settings**: the Field Notes visitor side. Written only through `/api/kb/*` (`src/endpoints/kb.ts`), which checks text with `src/utilities/moderation.ts`.
- **Pages** (drafts): title, hero, `layout` blocks (prose, mediaBlock, gallery, code, features, links, timeline, embed, content, cta, formBlock), showInNavigation, SEO, slug. Reserved slugs rejected.
- **Publications**: title, authors, year, publisher, kind, venue, doi, externalUrl, abstract, personalContribution, tags[], featured, order.
- **Experience**: role, company, companyUrl, location, startDate, endDate, current, summary, highlights[], technologies[], order.
- **Education**: institution, degree, field, startDate, endDate, location, notes, order.
- **Certifications**: title, issuer, year, url, order.
- **Media** (folders on): alt, caption; image sizes generated; MIME types restricted.
- **Categories**: title, slug (nested docs plugin).
- **Users**: Payload auth, admin only.

Plugins: SEO, redirects (pages, posts), nested docs (categories), search (posts), form builder (installed, unused until an email adapter exists), Vercel Blob storage (env-gated).

## Indexing and migrations
Slugs are unique indexes (Payload `slugField`). In development the schema is pushed automatically; for production run `pnpm payload migrate:create` once per schema change and `pnpm payload migrate` during deployment (see deployment.md).
