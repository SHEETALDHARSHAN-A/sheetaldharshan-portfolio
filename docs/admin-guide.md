# Admin guide

The admin lives at `/admin` (locally `http://localhost:3000/admin`, in production `https://sheetaldharshan.me/admin`).

## First login
On an empty database the admin shows **Create first user**. Enter your email and a strong password. There is no public sign-up; further users are created from **Users** by an existing admin.

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
