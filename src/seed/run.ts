/**
 * Seeds verified content into Payload. Safe to re-run: documents are matched by slug or title.
 * Never creates users. Run: pnpm seed
 */
import 'dotenv/config'
import { getPayload, type Payload, type Where } from 'payload'
import configPromise from '../payload.config'
import { about, appearance, categories, education, exampleDraftPost, experience, homepageMessages, navigation, projects, publications, siteSettings } from './data'

const context = { disableRevalidate: true }

function paragraphsToLexical(paragraphs: string[]) {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        textFormat: 0,
        children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 }],
      })),
    },
  }
}

async function upsert(payload: Payload, collection: 'projects' | 'experience' | 'education' | 'publications' | 'categories' | 'posts' | 'certifications', where: Where, data: Record<string, unknown>, status?: 'draft' | 'published') {
  const existing = await payload.find({ collection, where, limit: 1, pagination: false, depth: 0, draft: true })
  const payloadData = { ...data, ...(status ? { _status: status } : {}) }
  if (existing.docs[0]) {
    await payload.update({ collection, id: existing.docs[0].id, data: payloadData as never, context, draft: status === 'draft' })
    return existing.docs[0].id
  }
  const created = await payload.create({ collection, data: payloadData as never, context, draft: status === 'draft' })
  return created.id
}

async function main() {
  const payload = await getPayload({ config: configPromise })
  payload.logger.info('Seeding verified content…')

  await payload.updateGlobal({ slug: 'navigation', data: navigation as never, context })
  await payload.updateGlobal({ slug: 'site-settings', data: siteSettings as never, context })
  await payload.updateGlobal({ slug: 'appearance', data: appearance as never, context })
  await payload.updateGlobal({
    slug: 'homepage',
    data: { messages: homepageMessages.map((m) => ({ ...m, enabled: true, choices: m.choices ? [...m.choices] : [] })), animationPreset: 'calm', typingIndicator: 'dots', startDelay: 400, _status: 'published' } as never,
    context,
  })
  await payload.updateGlobal({ slug: 'about', data: { ...about, _status: 'published' } as never, context })
  payload.logger.info('Globals done')

  for (const entry of experience) await upsert(payload, 'experience', { and: [{ role: { equals: entry.role } }, { company: { equals: entry.company } }] }, { ...entry, highlights: entry.highlights.map((text) => ({ text })), technologies: entry.technologies.map((name) => ({ name })) }, 'published')
  for (const entry of education) await upsert(payload, 'education', { institution: { equals: entry.institution } }, entry, 'published')
  for (const entry of publications) await upsert(payload, 'publications', { doi: { equals: entry.doi } }, { ...entry, tags: entry.tags.map((name) => ({ name })) }, 'published')
  payload.logger.info('Profile collections done')

  const categoryIds: Record<string, number> = {}
  for (const title of categories) {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    categoryIds[title] = (await upsert(payload, 'categories', { slug: { equals: slug } }, { title, slug })) as number
  }

  for (const project of projects) {
    const { publish, needsReview, ...rest } = project
    void needsReview
    await upsert(
      payload,
      'projects',
      { slug: { equals: project.slug } },
      { ...rest, technologies: rest.technologies.map((name) => ({ name })), tags: rest.tags.map((name) => ({ name })) },
      publish ? 'published' : 'draft',
    )
  }
  payload.logger.info('Projects done')

  await upsert(
    payload,
    'posts',
    { slug: { equals: exampleDraftPost.slug } },
    {
      title: exampleDraftPost.title,
      slug: exampleDraftPost.slug,
      content: paragraphsToLexical(exampleDraftPost.paragraphs),
      categories: [categoryIds['Engineering Notes']].filter(Boolean),
      meta: { title: exampleDraftPost.title, description: exampleDraftPost.description },
    },
    'draft',
  )
  payload.logger.info('Example draft post done (unpublished)')
  payload.logger.info('Seed complete.')
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
