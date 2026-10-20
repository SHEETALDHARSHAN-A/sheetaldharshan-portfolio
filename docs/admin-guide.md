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

**2. GitHub fails: switch the GitHub step off.** If you can still get in, turn it off under **Admin panel → Sign-in & security**. If you can't:

1. Vercel → Project → Settings → Environment Variables → add `ADMIN_2FA` = `off` (Production).
2. Redeploy (Deployments → ⋯ → Redeploy). Environment changes only apply to new deployments.
3. Sign in with the password alone.
4. Fix GitHub, then **delete `ADMIN_2FA`** and redeploy, so the two-step sign-in is back on.

While `ADMIN_2FA=off` is set, anyone with the password gets in. Keep it off only as long as you need to.

## Add another admin
1. **Admin panel → Admin users → Create new.**
2. Enter their **name**, **email**, a **password** (share it with them privately; they can change it under *Your account*), and their **GitHub username** (e.g. `octocat`).
3. Save. They sign in at `/admin` with the email and password, then **Continue with GitHub** and approve with *that* GitHub account. The first time, GitHub asks them to authorise the app.

Each person's GitHub step must match their own GitHub username. Someone else's GitHub account is refused. A forgotten password is reset the same way: **Forgot password?** → GitHub. The GitHub account decides whose password is reset.

A user without a GitHub username falls back to the accounts listed in `src/config/admin.ts`. If the GitHub step is switched off (*Sign-in & security*), the password alone is enough for everyone.

Nothing needs changing on GitHub or Supabase for a new person: the same OAuth app serves everyone.

## Contact page
**Contact page → Chat, form & questions** sets the heading and intro, whether visitors write in a chat, a form or both (and which opens first), the chat's greeting and closing lines, and the questions themselves (add, remove, reorder; each with its type, chat question, required or optional, choices, and what the chat says when an answer does not fit).

**Messages** arrive in **Contact page → Messages**, with every answer. Tick **Handled** once you have replied.

**Email alerts** (Contact page → Email alerts): each new message is emailed to you, and replying answers the visitor.
- **Send alerts to**, **Sender name** and **Sender address** (on a domain verified in Resend; no mailbox needed).
- **Alert email (to you)** and the optional **"Thanks" email (to the visitor)**: subject, heading, intro, answer list, button and footer, with `{name}`, `{first}`, `{email}`, `{topic}`, `{site}` and `{url}` filled in.
- Each has a live preview and a **Send me a sample** button that uses the settings on screen before you save.
- Each message shows in its sidebar whether its alert went out.

First-time setup (Resend account, API key, verifying your domain): [Make it yours, step 8](make-it-yours.md#8-contact-page-and-email-alerts).

## Find anything
The search box at the top of the admin menu (**⌘K** or **/**) finds settings pages, any field by its label (showing where it lives, for example *Pet › Behaviour*), content by title, and "New …" actions. It reads the CMS setup itself, so pages and fields added later are found without extra work. The **More** group in *Edit by page* lists anything new that hasn't been placed in the menu yet.

## The admin panel itself
**Admin panel** in the menu:
- **Logo, colours & font** (*Admin look*): the login-page logo and name, the menu icon, the default avatar, the accent colour, background colours for dark and light mode, the font and the corner style. Empty fields keep the SD logo and Payload's colours. Reload after saving.
- **Your account, photo & theme**: your name, email and password, your **photo** (shown top right instead of the default avatar), and light or dark mode for the admin.
- **Sign-in & security (2FA)**: switch the GitHub two-step sign-in on or off. Off means the password alone signs you in. It takes effect within about a minute.
- **Admin users**: who can sign in.
- **Import & export (site.json)**: download every setting and piece of content as one JSON file, edit it (or have an AI fill it in), and import it back with a preview first. See [site.json](site-json.md).

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

## ./stdout (posts, channels, comments)
./stdout lives at `/notes`. It works like Slack: a sidebar of **channels**, each listing its posts. Readers can star channels, rate posts, comment in threads, and send feedback on any sentence. Everything is under **Edit by page → ./stdout**.

### Channels
**./stdout → Channels**: a title, an optional emoji (shown instead of #), a one-line description and an **Order** (lower comes first). Each channel has its own page at `/notes/c/<slug>`. Readers star channels to pin them under **Starred** in their sidebar, and the star count shows on the channel page.

### Write a post
**Posts → Create new**. Add a title and an optional hero image, then write in the editor: headings, lists, quotes, links and tables. Type `/` or use **+** to add a block:

| Block | What it does |
|---|---|
| **Prerequisite** | A "Before you go on" card anywhere in the text, linking to other posts and/or a whole channel, with an optional note. |
| **Photo** | An uploaded image or an image link, with alt text, a caption, an optional click-through link, and a size (text width, small, wide). |
| **Video** | A YouTube or Vimeo link, a direct `.mp4`/`.webm` link, or an uploaded video, with a caption. |
| **Audio** | A Spotify or SoundCloud link, a direct audio link (`.mp3`, `.m4a`…), or an uploaded audio file, with a title and caption. |
| **Gallery** | Several images in one, two or three columns. |
| **Code**, **Banner**, **Media** | Code with highlighting, a coloured note, a plain uploaded file. |

In the sidebar:
- **Channels**: the first one is the post's home channel.
- **Read first**: shows as "Before you read" at the top of the post.
- **Related posts**: listed at the end of the post.
- **Published at**: the post's date.

The **SEO** tab's description is also the summary shown in the lists. **Save draft** stays private, **Preview** shows it, and **Publish** lists it on `/notes`, in its channel and in `/rss.xml`.

### Readers: signing in, anonymous comments, reports
- **Sign in** with GitHub or a one-time **email link** (sent through Resend, valid 15 minutes). There are no passwords.
  - GitHub readers show their GitHub picture and a **blue verified tick**, and their name links to their GitHub profile.
  - GitHub sign-in reuses the GitHub app already set up in Supabase for the admin, so it needs no extra setup.
- **Sessions:** a signed token in a secure, httpOnly cookie, valid for 30 days and renewed while the reader keeps visiting. Readers can sign out, or **sign out on all devices**, from their floating avatar (bottom right) or the ./stdout sidebar.
- **Signed-in readers** can comment and **edit** or **delete** their own comments. An edited comment shows "· edited", with the time on hover; a deleted comment with replies shows "deleted" so the thread stays readable. They can also **like** comments, **star** channels and **rate** posts, each once per person. Their own page, **`/notes/me`**, lists what they starred, wrote, rated and liked, plus the reports they sent and what happened to each.
- **Their own channels:** signed-in readers can create, rename, describe and delete private channels, and save any post into them with the **Save** button on the post. These show under **Your channels** in the side column, on `/notes/saved/<id>`, and on their page. They're private to each reader; you see them under **./stdout → Reader channels** so you can remove one if ever needed.
- **Anonymous comments** (no sign-in) show as "Anonymous" and can't be edited or deleted by their writer. Any link in one waits for approval.
- **Anyone can report** a comment, with a reason and a note. You get an email; reports are under **./stdout → Reported comments**. Hide or delete the comment, then set the report to *Actioned* or *Dismissed*; signed-in reporters see that status on their page.
- **Feedback on selected text** needs no sign-in.
- **Times** are relative ("just now", "5 min ago", "yesterday"), stay up to date while the page is open, and show the exact date and time on hover.

You get an email for each comment, written review, report and piece of feedback. It uses the sender and address under **Contact page → Email alerts**, with a button that opens the item in the admin.

### Switches: site-wide and per post
**./stdout → Settings → What readers can do** turns each part on or off for the whole site:

| Switch | What it controls |
|---|---|
| **Comments** | Comments on posts. |
| **Anonymous comments** | Off means readers must sign in to comment. |
| **Likes on comments** | Liking comments. |
| **Star ratings & reviews** | Rating posts, with an optional review. |
| **Starring channels** | Starring channels in the sidebar. |
| **Reporting comments** | The Report button on comments. |
| **Feedback on selected text** | The select-to-feedback bar and Send feedback button. |
| **Reader sign-in** | Off means nobody can sign in, and likes, stars and ratings stop. |
| **Email me each one** | An email for each comment, review, report and piece of feedback. |

Each **post** can override comments, ratings, likes and feedback in its sidebar under **Reader interaction**:
- **Site default** follows the Settings page.
- **On** and **Off** override it for that post.
- For comments, **Locked** keeps existing comments visible but closes the post to new ones.

### The side column and empty pages
**./stdout → Settings → Side column** sets every label in the right-hand column:
- The search placeholder, and the Browse, All posts, Channels, readers' own channels and account headings.
- The New channel button and its placeholder, the hint for readers without channels, the sign-in link text, and the Privacy link.

It also sets how the tree behaves:
- **Sections open at first:** which sections start open. Readers can still fold any of them, and their choice is remembered.
- **Open the current channel by itself.**
- **Show post counts.**
- **Posts listed under each channel:** 0 turns the fold-out lists off.

**Empty pages and labels** sets the terminal-style lines shown when there is nothing to list (no posts, a search with no results, an empty channel), plus the small labels above the headings. Empty fields use the defaults, which are shown greyed out in each field.

### Moderation and blocking
Comments and reviews are checked before they show:
- **Refused outright:** slurs, threats and severe abuse, in English or in Hindi/Tamil written in English letters. Disguised spellings (`f*ck`, `sh1t`, `b.i.t.c.h`) are caught too, and the writer is asked to rephrase.
- **Held for your approval:** swearing, several links, all capitals and spam patterns. The writer sees their comment marked "Waiting for approval"; nobody else does.
- **Shown straight away:** everything else.

**Settings → Moderation** can instead hold every anonymous comment, or hold everything. Add your own refused words under **Blocked words**.

To handle comments, reviews and readers:
- **./stdout → Comments** (or **Reviews**): set **Status** to *Shown*, *Hidden* or *Waiting for approval*, or delete. **Why held** says what the checks found.
- **Block this reader:** a button in each comment's or review's sidebar. A blocked reader is signed out at once, can't post, and everything they wrote is hidden. You can also add a private reason.
- **./stdout → Readers:** everyone who signed in, and the same **Block** status. Raise **Session version** by 1 to sign someone out on every device without blocking them.
- **./stdout → Feedback:** fix the post, then tick **Handled**.

## Manage media
**Media** holds images, MP4/WebM videos and PDFs. Give every image an **Alt** text. Images get responsive sizes automatically. Replace a file from its edit page; references update. Folders are available for organisation.

## Create a page
**Pages → Create new**. Title, slug (for example `uses`; reserved paths such as `projects`, `blog`, `admin` are rejected), blocks, SEO. Tick **Show in navigation** to add it to the sidebar. Publish and it is live at `/uses`.

## Edit navigation
**Navigation**: the sidebar items in order (label, href, visible). Pages with **Show in navigation** are appended automatically. **Footer links** show under the social links.

## Appearance
**Theme → Colours** has one-click themes (Yakudoo, Midnight, Graphite, Forest, Ember, Ocean), each with a dark and a light version, plus separate **Dark mode colours** and **Light mode colours** to fine-tune. **Default mode** is what a first-time visitor sees: dark, light, or their device's setting. **Show the light/dark switch** adds the animated sun/moon button at the bottom of the sidebar (top bar on phones); each visitor's choice is remembered in their browser.

**Appearance**: theme (dark/light), accent, font preset, heading scale, spacing, radius, link style, bubble style, animation intensity and speed, project display style (explorer or grid). All are fixed presets; save and the public site changes on the next load.

## About, Research, Site settings
- **About**: intro paragraphs, photo, résumé (in Site settings), and ordered sections. Sections of kind Experience, Education, Certifications, Publications and Selected projects pull from their collections; Text sections are rich text; Technologies holds labelled groups (comma-separated).
- **Publications**, **Experience**, **Education**, **Certifications** (sidebar group "Profile"): one entry each, drafts supported.
- **Site settings**: names, tagline, description, canonical URL, role, location, social links, optional email, résumé, default social image, footer note.

**Résumé:** upload a PDF, or paste a **Résumé link** (used instead of the upload). A GitHub release link downloads straight away, with no browser warning about an unfamiliar site. To update it later, replace the file on the same release (`gh release upload resume Your_Resume.pdf --clobber -R <you>/<repo>`); the link stays the same.

## Drafts, preview, versions
Everything with a status has **Draft** and **Published**. Preview uses a secret URL and shows the draft only to you. Each save creates a version; open **Versions** on a document to compare and restore.

## Caching
Pages render on request. A publish is visible immediately; there is no scheduled cache. If a page looks stale after an edit, reload once.
