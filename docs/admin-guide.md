# Admin guide

The admin lives at `/admin` (locally `http://localhost:3000/admin`, in production `https://sheetaldharshan.me/admin`).

## First login
On an empty database the admin shows **Create first user**. Enter your email and a strong password. There is no public sign-up; further users are created from **Users** by an existing admin.

## Signing in
Sign-in is two steps: your email and password, then a GitHub check of the account listed in `src/config/admin.ts`. The GitHub step switches on once GitHub is enabled in Supabase; until then the password alone is enough. **Forgot your password?** on the login page resets it through GitHub. Setup: [Make it yours, step 7](make-it-yours.md#7-secure-the-admin-password-then-github).

### Locked out? Two overrides

Use these when you forgot the password or GitHub is failing (GitHub down, OAuth app deleted, lost access to the account).

**1. Forgot the password: reset it from your machine.** This works whether or not GitHub is set up, because it writes the new password straight into the database.

```sh
pnpm admin:reset-password
```

It asks for the admin email and a new password (hidden as you type). It uses `DATABASE_URL` from your local `.env`, so point that at the live database to reset the live admin. No deploy is needed. To run it without prompts, set `ADMIN_EMAIL` and `NEW_PASSWORD` for that one command.

**2. GitHub fails: switch the GitHub step off.**

1. Vercel → Project → Settings → Environment Variables → add `ADMIN_2FA` = `off` (Production).
2. Redeploy (Deployments → ⋯ → Redeploy). Environment changes only apply to new deployments.
3. Sign in with the password alone.
4. Fix GitHub, then **delete `ADMIN_2FA`** and redeploy, so the two-step sign-in is back on.

While `ADMIN_2FA=off` is set, anyone with the password gets in. Keep it off only as long as you need to.

## Find anything
The search box at the top of the admin menu (**⌘K** or **/**) finds settings pages, any field by its label (showing where it lives, for example *Pet › Behaviour*), content by title, and "New …" actions. It reads the CMS setup itself, so pages and fields added later are found without extra work. The **More** group in *Edit by page* lists anything new that hasn't been placed in the menu yet.

## The admin panel itself
**Admin panel** in the menu:
- **Logo, colours & font** (*Admin look*): the login-page logo and name, the menu icon, the default avatar, the accent colour, background colours for dark and light mode, the font and the corner style. Empty fields keep the SD logo and Payload's colours. Reload after saving.
- **Your account, photo & theme**: your name, email and password, your **photo** (shown top right instead of the default avatar), and light or dark mode for the admin.
- **Admin users**: who can sign in.

Image settings (favicons, pet, About photo, link preview, admin logos) show an **In use now** preview: what the site is using today, and whether it's your upload or the built-in default.

## Edit the homepage conversation
**Homepage conversation** in the sidebar. Each row is one bubble.
- **Content**: the text. Inline links use `[label](/projects)` or `[label](https://…)`.
- **Style**: default, accent or muted.
- **Reveal delay**: leave empty for the reference timing (characters × 20 ms + 500 ms), or set milliseconds.
- **Enabled**: untick to hide a bubble without deleting it.
- **Navigation choices**: links rendered as one extra bubble under the message ("See what I've built, Read what I'm learning and …"). Add, edit, reorder or remove them here.
- Drag the handle on the left of a row to reorder. **Animation** (collapsed) holds the preset, typing indicator and start delay.
- **Save draft** keeps it private. **Preview** opens the draft on the real homepage. **Publish changes** makes it live on the next request. **Versions** (top right) restores an earlier version.

## Publish a project
**Projects → Create new**. Fill the **Overview** tab (title, summary, kind, category, year, role, technologies). Add media in **Media** (thumbnail for the list, hero image, and a short silent MP4/WebM loop for the stage; the two seeded projects already have an illustrative artwork and loop, replace them with real captures when you have them). Build the page in **Page** by adding blocks: Text, Media, Gallery, Code, Feature list, Timeline, Link list, Facts, Embed (YouTube/Vimeo). Add links in **Links** and metadata in **SEO**. In the sidebar set **Featured** (shown on About), **Display order** (lower first), **Accent** (stage tint when there is no media), or **Archived** to hide it. Autosave keeps a draft; **Publish** makes it appear on `/projects` and at `/projects/<slug>`. The slug is generated from the title and can be edited.

## Write and publish an article
**Posts → Create new**. Title, optional hero image, then write in the editor: headings, lists, quotes, links, tables, images (Media block), code (Code block), banners. Pick **Categories** in the sidebar and set **Published at**. The **SEO** tab's description is also the excerpt shown in the list. **Save draft** stays private; **Preview** shows it; **Publish** lists it on `/blog` and in `/rss.xml`. Related posts appear at the end of the article.

Markdown import: paste the text into the editor; the Lexical editor converts common Markdown shortcuts (`#`, `-`, `>`, triple backticks) as you type. There is no bulk importer.

## Manage media
**Media** holds images, MP4/WebM videos and PDFs. Give every image an **Alt** text. Images get responsive sizes automatically. Replace a file from its edit page; references update. Folders are available for organisation.

## Create a page
**Pages → Create new**. Title, slug (for example `uses`; reserved paths such as `projects`, `blog`, `admin` are rejected), blocks, SEO. Tick **Show in navigation** to add it to the sidebar. Publish and it is live at `/uses`.

## Edit navigation
**Navigation**: the sidebar items in order (label, href, visible). Pages with **Show in navigation** are appended automatically. **Footer links** show under the social links.

## Appearance
**Appearance**: theme (dark/light), accent, font preset, heading scale, spacing, radius, link style, bubble style, animation intensity and speed, project display style (explorer or grid). All are fixed presets; save and the public site changes on the next load.

## About, Research, Site settings
- **About**: intro paragraphs, photo, résumé (in Site settings), and ordered sections. Sections of kind Experience, Education, Certifications, Publications and Selected projects pull from their collections; Text sections are rich text; Technologies holds labelled groups (comma-separated).
- **Publications**, **Experience**, **Education**, **Certifications** (sidebar group "Profile"): one entry each, drafts supported.
- **Site settings**: names, tagline, description, canonical URL, role, location, social links, optional email, résumé, default social image, footer note.

## Drafts, preview, versions
Everything with a status has **Draft** and **Published**. Preview uses a secret URL and shows the draft only to you. Each save creates a version; open **Versions** on a document to compare and restore.

## Caching
Pages render on request. A publish is visible immediately; there is no scheduled cache. If a page looks stale after an edit, reload once.
