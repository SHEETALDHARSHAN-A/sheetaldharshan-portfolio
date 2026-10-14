import { test, expect, type Page } from '@playwright/test'
import { login } from '../helpers/login'
import { seedTestUser, cleanupTestUser, testUser } from '../helpers/seedUser'
import { cleanupE2E, payloadClient } from '../helpers/content'

const base = 'http://localhost:3000'

test.describe.serial('Admin workflows', () => {
  let page: Page
  let originalMessage = ''

  test.beforeAll(async ({ browser }) => {
    await cleanupE2E()
    await seedTestUser()
    const context = await browser.newContext()
    page = await context.newPage()
    await login({ page, user: testUser })
  })

  test.afterAll(async () => {
    const payload = await payloadClient()
    if (originalMessage) {
      const homepage = await payload.findGlobal({ slug: 'homepage', depth: 0 })
      const messages = (homepage.messages ?? []).map((m, i) => (i === 1 ? { ...m, content: originalMessage } : m))
      await payload.updateGlobal({ slug: 'homepage', data: { messages, _status: 'published' } as never, context: { disableRevalidate: true } })
    }
    await payload.updateGlobal({ slug: 'appearance', data: { accent: 'blue' } as never, context: { disableRevalidate: true } })
    await cleanupE2E()
    await cleanupTestUser()
  })

  test('admin login reaches the dashboard', async () => {
    await page.goto(`${base}/admin`)
    await expect(page.locator('span[title="Dashboard"]').first()).toBeVisible()
  })

  test('anonymous users cannot modify content', async ({ request }) => {
    const res = await request.post(`${base}/api/projects`, { data: { title: 'nope', summary: 'nope', slug: 'e2e-nope' } })
    expect([401, 403]).toContain(res.status())
    const patch = await request.post(`${base}/api/globals/homepage`, { data: { messages: [] } })
    expect([401, 403]).toContain(patch.status())
  })

  test('scenario A: editing a homepage message and publishing updates the homepage', async () => {
    const payload = await payloadClient()
    const before = await payload.findGlobal({ slug: 'homepage', depth: 0 })
    originalMessage = before.messages?.[1]?.content ?? ''
    await page.goto(`${base}/admin/globals/homepage`)
    const field = page.locator('textarea[name="messages.1.content"]')
    await expect(field).toBeVisible()
    await field.fill("Hey, I'm Sheetaldharshan.")
    await page.getByRole('button', { name: /^Publish changes$|^Publish$/ }).first().click()
    await expect
      .poll(async () => (await (await payloadClient()).findGlobal({ slug: 'homepage', depth: 0 })).messages?.[1]?.content, { timeout: 20000 })
      .toBe("Hey, I'm Sheetaldharshan.")
    const check = await page.context().newPage()
    await check.goto(base)
    await expect(check.locator('.jg-bubble').nth(1)).toContainText("Hey, I'm Sheetaldharshan.")
    await check.close()
  })

  test('scenario B: creating and publishing a project exposes it on /projects and its own page', async () => {
    await page.goto(`${base}/admin/collections/projects/create`)
    await page.fill('input[name="title"]', 'E2E New AI Project')
    await page.fill('textarea[name="summary"]', 'Created by the end-to-end suite.')
    // The slug is generated from the title ("e2e-new-ai-project") while "generate slug" stays ticked.
    // Autosave stores a draft and moves to the edit URL; publish from there.
    await page.waitForURL(/\/admin\/collections\/projects\/\d+/, { timeout: 20000 })
    await page.waitForLoadState('networkidle')
    const publish = page.getByRole('button', { name: /^Publish changes$|^Publish$/ }).first()
    await expect(publish).toBeEnabled()
    await page.waitForTimeout(800)
    await publish.click()
    await expect(page.locator('text=Updated successfully')).toBeVisible({ timeout: 15000 })
    const payload = await payloadClient()
    await expect
      .poll(async () => {
        const found = await payload.find({ collection: 'projects', draft: false, sort: '-createdAt', where: { title: { equals: 'E2E New AI Project' } }, limit: 1 })
        const doc = found.docs[0]
        return doc ? `${doc._status}:${doc.slug}` : 'missing'
      }, { timeout: 20000 })
      .toBe('published:e2e-new-ai-project')
    const check = await page.context().newPage()
    await check.goto(`${base}/projects`)
    await expect(check.locator('.project-row', { hasText: 'E2E New AI Project' })).toBeVisible()
    await check.goto(`${base}/projects/e2e-new-ai-project`)
    await expect(check.locator('h1')).toContainText('E2E New AI Project')
    await check.close()
  })

  test('scenario C: a draft post is private, a published post appears on /blog', async () => {
    const payload = await payloadClient()
    const content = {
      root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', textFormat: 0, children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Written by the e2e suite.', version: 1 }] }] },
    }
    const post = await payload.create({ collection: 'posts', draft: true, data: { title: 'E2E Building Reliable AI Agents', slug: 'e2e-building-reliable-ai-agents', content, _status: 'draft' } as never, context: { disableRevalidate: true } })
    const check = await page.context().newPage()
    const draft = await check.goto(`${base}/blog/e2e-building-reliable-ai-agents`)
    expect(draft?.status()).toBe(404)
    await payload.update({ collection: 'posts', id: post.id, data: { _status: 'published', publishedAt: new Date().toISOString() } as never, context: { disableRevalidate: true } })
    await check.goto(`${base}/blog`)
    await expect(check.locator('.post-item h2', { hasText: 'E2E Building Reliable AI Agents' })).toBeVisible()
    await check.goto(`${base}/blog/e2e-building-reliable-ai-agents`)
    await expect(check.locator('article h1')).toContainText('Building Reliable AI Agents')
    await check.close()
  })

  test('scenario D: changing the accent in Appearance changes the public theme', async () => {
    const payload = await payloadClient()
    await payload.updateGlobal({ slug: 'appearance', data: { accent: 'orange' } as never, context: { disableRevalidate: true } })
    const check = await page.context().newPage()
    await check.goto(`${base}/projects`)
    await expect(check.locator('html')).toHaveAttribute('data-accent', 'orange')
    await check.close()
  })

  test('scenario E: a new CMS page is available at its slug without code changes', async () => {
    const payload = await payloadClient()
    await payload.create({
      collection: 'pages',
      data: {
        title: 'E2E Uses',
        slug: 'e2e-uses',
        _status: 'published',
        hero: { type: 'none' },
        layout: [{ blockType: 'prose', heading: 'Hardware', richText: { root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', textFormat: 0, children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'A laptop.', version: 1 }] }] } } }],
      } as never,
      context: { disableRevalidate: true },
    })
    const check = await page.context().newPage()
    await check.goto(`${base}/e2e-uses`)
    await expect(check.locator('h1')).toContainText('E2E Uses')
    await expect(check.locator('.case-section h2')).toContainText('Hardware')
    await check.close()
  })

  test('reserved slugs are rejected for CMS pages', async () => {
    const payload = await payloadClient()
    await expect(payload.create({ collection: 'pages', data: { title: 'Bad', slug: 'projects', _status: 'draft', hero: { type: 'none' }, layout: [] } as never })).rejects.toThrow(/reserved/)
  })

  test('scenario F: navigation and media uploads work', async () => {
    const payload = await payloadClient()
    const nav = await payload.findGlobal({ slug: 'navigation', depth: 0 })
    await payload.updateGlobal({ slug: 'navigation', data: { items: [...(nav.items ?? []), { label: 'E2E Uses', href: '/e2e-uses', visible: true }] } as never, context: { disableRevalidate: true } })
    const check = await page.context().newPage()
    await check.goto(`${base}/about`)
    await expect(check.locator('.sidebar-nav a', { hasText: 'E2E Uses' })).toBeVisible()
    await payload.updateGlobal({ slug: 'navigation', data: { items: nav.items } as never, context: { disableRevalidate: true } })
    await check.close()

    await page.goto(`${base}/admin/collections/media/create`)
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')
    await page.setInputFiles('input[type="file"]', { name: 'e2e-pixel.png', mimeType: 'image/png', buffer: png })
    await page.fill('input[name="alt"]', 'e2e pixel')
    await page.getByRole('button', { name: /^Save$/ }).first().click()
    await page.waitForURL(/\/admin\/collections\/media\/\d+/, { timeout: 20000 })
    const media = await payload.find({ collection: 'media', where: { filename: { like: 'e2e-pixel' } }, limit: 1 })
    expect(media.docs.length).toBe(1)
    const res = await page.request.get(`${base}${media.docs[0].url}`)
    expect(res.ok()).toBeTruthy()
    await payload.delete({ collection: 'media', id: media.docs[0].id })
  })
})
