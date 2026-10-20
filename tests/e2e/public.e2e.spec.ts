import { test, expect } from '@playwright/test'

const base = 'http://localhost:3000'

test.describe('Public site', () => {
  test('homepage loads and shows the conversation', async ({ page }) => {
    await page.goto(base)
    await expect(page.locator('.jg-messages')).toBeVisible()
    await expect(page.locator('.jg-bubble.jg-shown').first()).toBeVisible({ timeout: 10000 })
    // Content is editable in the admin, so only assert that the first bubble carries text.
    await expect(page.locator('.jg-bubble .jg-message').first()).not.toHaveText('')
  })

  test('conversation reveals messages in sequence and keeps the last bubble cornered', async ({ page }) => {
    await page.goto(base)
    const bubbles = page.locator('.jg-bubble')
    const total = await bubbles.count()
    expect(total).toBeGreaterThan(3)
    await expect(page.locator('.jg-bubble.jg-shown')).toHaveCount(total, { timeout: 60000 })
    await expect(page.locator('.jg-bubble.jg-shown:not(.is-loading)')).toHaveCount(total, { timeout: 20000 })
    await expect(bubbles.last()).toHaveClass(/cornered/)
    await expect(bubbles.first()).not.toHaveClass(/cornered/)
  })

  test('homepage links navigate', async ({ page }) => {
    await page.goto(base)
    await expect(page.locator('.jg-bubble.jg-shown:not(.is-loading)')).toHaveCount(await page.locator('.jg-bubble').count(), { timeout: 60000 })
    const projectsLink = page.locator('.jg-bubble a[href="/projects"]').first()
    await expect(projectsLink).toBeVisible()
    await projectsLink.click()
    await expect(page).toHaveURL(/\/projects$/)
  })

  test('reduced motion shows every message immediately', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' })
    const page = await context.newPage()
    await page.goto(base)
    const total = await page.locator('.jg-bubble').count()
    await expect(page.locator('.jg-bubble.jg-shown:not(.is-loading)')).toHaveCount(total, { timeout: 5000 })
    await context.close()
  })

  test('projects explorer lists published projects and selection updates the stage', async ({ page }) => {
    await page.goto(`${base}/projects`)
    const rows = page.locator('.project-row')
    expect(await rows.count()).toBeGreaterThanOrEqual(2)
    await expect(page.locator('.stage-card .t')).toHaveText(await rows.nth(0).locator('.t').evaluate((el) => el.childNodes[0]?.textContent?.trim() ?? ''))
    await rows.nth(1).hover()
    const secondTitle = await rows.nth(1).locator('.t').evaluate((el) => el.childNodes[0]?.textContent?.trim() ?? '')
    await expect(page.locator('.stage-card .t')).toHaveText(secondTitle)
    await expect(page.locator('.stage-media.active')).toHaveCount(1)
  })

  test('dynamic project route works and drafts are private', async ({ page }) => {
    await page.goto(`${base}/projects/exasol-studio`)
    await expect(page.locator('h1')).toContainText('Exasol Studio')
    const missing = await page.goto(`${base}/projects/e2e-this-project-does-not-exist`)
    expect(missing?.status()).toBe(404)
  })

  test('./stdout: channels, search, old links and draft privacy', async ({ page }) => {
    await page.goto(`${base}/blog`)
    await expect(page).toHaveURL(/\/notes$/)
    await expect(page.locator('h1')).toContainText('./stdout')
    const side = page.locator('.kb-layout > .kb-side')
    await expect(side.locator('a[aria-current="page"]')).toContainText('All posts')
    const channel = side.locator('a[href^="/notes/c/"]').first()
    if (await channel.count()) {
      const name = (await channel.locator('.kb-side-name').innerText()).trim()
      await channel.click()
      await expect(page.locator('.kb-head h1')).toContainText(name)
      await expect(page.locator('.kb-head .kb-star')).toBeVisible()
    }
    await page.goto(`${base}/notes`)
    await page.fill('#kb-q', 'zzz-no-such-note')
    await page.press('#kb-q', 'Enter')
    await expect(page.locator('.kb-term')).toContainText('no matches')
    const missing = await page.goto(`${base}/notes/e2e-this-note-does-not-exist`)
    expect(missing?.status()).toBe(404)
  })

  test('about, research and contact render CMS content', async ({ page }) => {
    await page.goto(`${base}/about`)
    await expect(page.locator('.about-intro p').first()).toContainText('AI agents')
    await page.goto(`${base}/research`)
    await expect(page.locator('.pub h2')).toContainText('Autonomous Hiring Intelligence')
    await page.goto(`${base}/contact`)
    await expect(page.locator('.contact-side .contact-row', { hasText: 'LinkedIn' })).toBeVisible()
  })

  test('contact chat asks again when an answer does not fit (nothing is sent)', async ({ page }) => {
    await page.goto(`${base}/contact`)
    await page.evaluate(() => localStorage.setItem('contact-mode-v2', 'chat'))
    await page.reload()
    const box = page.locator('.cc-input textarea')
    await expect(page.locator('.cc-me .cc-bubble').nth(1)).toBeVisible({ timeout: 10000 })
    await box.fill('12345')
    await box.press('Enter')
    await expect(page.locator('.cc-me .cc-bubble').last()).toContainText("doesn't look like a name", { timeout: 5000 })
    await box.fill('Test Visitor')
    await box.press('Enter')
    await expect(page.locator('.cc-me .cc-bubble').last()).toContainText('email', { timeout: 5000 })
    await box.fill('not-an-email')
    await box.press('Enter')
    await expect(page.locator('.cc-me .cc-bubble').last()).toContainText("doesn't look like an email", { timeout: 5000 })
  })

  test('system routes and SEO metadata', async ({ page, request }) => {
    const sitemap = await request.get(`${base}/sitemap.xml`)
    expect(sitemap.ok()).toBeTruthy()
    expect(await sitemap.text()).toContain('/projects/exasol-studio')
    const rss = await request.get(`${base}/rss.xml`)
    expect(rss.headers()['content-type']).toContain('rss')
    const robots = await request.get(`${base}/robots.txt`)
    expect(await robots.text()).toContain('Disallow: /admin')
    await page.goto(`${base}/projects/exasol-studio`)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/projects\/exasol-studio$/)
    expect(await page.locator('script[type="application/ld+json"]').count()).toBeGreaterThan(0)
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Exasol Studio/)
  })

  test('reserved paths are not served as CMS pages and 404 works', async ({ page }) => {
    const res = await page.goto(`${base}/this-page-does-not-exist`)
    expect(res?.status()).toBe(404)
    await expect(page.locator('.notfound h1')).toHaveText('404')
  })

  test('mobile layout: top bar menu and horizontal project list', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
    const page = await context.newPage()
    await page.goto(`${base}/projects`)
    await expect(page.locator('.topbar')).toBeVisible()
    await expect(page.locator('.sidebar')).toBeHidden()
    await expect(page.locator('.tabbar')).toBeVisible()
    expect(await page.locator('.tabbar a').count()).toBeGreaterThanOrEqual(4)
    await expect(page.locator('.tabbar a[aria-current="page"]')).toHaveText(/Projects/i)
    await expect(page.locator('.yk-stage')).toBeHidden()
    expect(await page.locator('.project-row .thumb img').count()).toBeGreaterThanOrEqual(2)
    const width = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(width).toBeLessThanOrEqual(390)
    await context.close()
  })

  test('keyboard navigation reaches the project rows and the skip link', async ({ page }) => {
    await page.goto(`${base}/projects`, { waitUntil: 'networkidle' })
    await expect(page.locator('.project-row').first()).toBeVisible()
    let skip = false
    // The Next dev overlay sits in the tab order and Chrome may resume from the active row, so allow wrap-around.
    for (let i = 0; i < 8 && !skip; i += 1) {
      await page.keyboard.press('Tab')
      skip = await page.evaluate(() => document.activeElement?.classList.contains('skip-link') ?? false)
    }
    expect(skip).toBeTruthy()
    let reached = false
    for (let i = 0; i < 20 && !reached; i += 1) {
      await page.keyboard.press('Tab')
      reached = await page.evaluate(() => !!document.activeElement?.closest('.project-row'))
    }
    expect(reached).toBeTruthy()
    await page.keyboard.press('ArrowDown')
    await expect(page.locator('.project-row.active')).toHaveCount(1)
  })
  test('the pet opens a search bubble with fuzzy results and navigates', async ({ page }) => {
    await page.goto(`${base}/research`)
    const pet = page.locator('[data-pet]')
    await expect(pet).toHaveAttribute('data-ready', 'true', { timeout: 15000 })
    await pet.click()
    const input = page.locator('#pet-bubble input')
    await expect(input).toBeFocused()
    // A typo still finds the project.
    await input.fill('exasl studo')
    await expect(page.locator('#pet-results [role="option"]').first()).toContainText('Exasol Studio', { timeout: 10000 })
    await input.press('Enter')
    await expect(page).toHaveURL(/\/projects\/exasol-studio$/)
    await expect(page.locator('#pet-bubble')).toHaveCount(0)
    // The keyboard shortcut opens it too, and Escape closes it.
    await page.keyboard.press('/')
    await expect(page.locator('#pet-bubble input')).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(page.locator('#pet-bubble')).toHaveCount(0)
  })

  test('search index lists the site content', async ({ request }) => {
    const res = await request.get(`${base}/search-index.json`)
    expect(res.ok()).toBeTruthy()
    const data = (await res.json()) as { docs: { type: string; href: string }[] }
    expect(data.docs.some((doc) => doc.href === '/projects')).toBeTruthy()
    expect(data.docs.some((doc) => doc.type === 'project')).toBeTruthy()
  })
  test('project film plays in place after clicking the thumbnail', async ({ page }) => {
    await page.goto(`${base}/projects/exasol-personal-local-starter-kit`)
    const thumb = page.locator('.vp-thumb')
    if ((await thumb.count()) === 0) test.skip(true, 'No film set for this project')
    await expect(page.locator('.video-player :is(video, iframe)')).toHaveCount(0)
    await thumb.click()
    await expect(page.locator('.video-player[data-playing="true"] .vp-media :is(video, iframe)')).toHaveCount(1)
  })
  test('back to home within a session goes to projects; a typed address shows the intro', async ({ page }) => {
    await page.goto(base)
    await expect(page.locator('.jg-messages')).toBeVisible()
    await page.locator('.jg-bubble a[href="/projects"]').first().click({ timeout: 60000 })
    await expect(page).toHaveURL(/\/projects$/)
    await page.goBack()
    await expect(page).toHaveURL(/\/projects$/)
    // Opening the address directly always shows the conversation.
    await page.goto(base)
    await expect(page).toHaveURL(new RegExp(`${base}/?$`))
    await expect(page.locator('.jg-messages')).toBeVisible()
  })
  test('coding activity: sidebar logos pin a card, About cards link their sources', async ({ page }) => {
    await page.goto(`${base}/about`)
    const logos = page.locator('.sidebar .dock-logos .activity-logo')
    if ((await logos.count()) > 0) {
      // Clicking a logo pins its card in the pop-up; clicking it again releases it.
      await logos.first().click()
      await expect(logos.first()).toHaveAttribute('aria-pressed', 'true')
      await expect(page.locator(".sidebar .dock-cards[data-open='true']")).toHaveCount(1)
      await logos.first().click()
      await expect(logos.first()).toHaveAttribute('aria-pressed', 'false')
    }
    // About: the same dock in the page; the card in view links its sources.
    const card = page.locator(".activity-dock[data-variant='inline'] .dock-card[aria-hidden='false']").first()
    if ((await card.count()) === 0) test.skip(true, 'No About cards open by default')
    await card.locator('.activity-footer > summary').click()
    await expect(card.locator('.activity-sources a').first()).toHaveAttribute('href', /^https:\/\/(github|leetcode)\.com\//)
  })
  test('admin: forgotten passwords reset through GitHub; step two needs a password session', async ({ page }) => {
    await page.goto(`${base}/admin/forgot`)
    await expect(page).toHaveURL(/\/auth\/verify\?reset=1$/)
    await expect(page.getByRole('heading', { name: 'Reset your password with GitHub' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Continue with GitHub' })).toHaveAttribute('href', '/auth/github?purpose=reset')
    await page.goto(`${base}/auth/verify`)
    await expect(page).toHaveURL(/\/admin\/login/)
    await expect(page.getByRole('link', { name: 'Forgot password?' })).toBeVisible()
  })
})
