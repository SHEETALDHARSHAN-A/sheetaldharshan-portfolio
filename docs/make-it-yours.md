# Make it yours

How to turn this repository into **your** portfolio: what you need, what to change, and in what order. Plan on an afternoon to get it live, plus whatever time your own content takes.

> **Licence first.** The repository has no open-source licence yet (see [CONTRIBUTING](../CONTRIBUTING.md#licence)), so ask the owner before reusing the code. The homepage recreates [juliangarnier.com](https://juliangarnier.com) (CC BY-NC 4.0): keep a credit and don't use that part commercially.

## At a glance

| # | Step | Time | Needed? |
|---|---|---|---|
| 0 | [Accounts and tools](#0-accounts-and-tools) | 15 min | Yes |
| 1 | [Run it on your machine](#1-run-it-on-your-machine) | 20 min | Yes |
| 2 | [Replace the owner's identity in code](#2-replace-the-owners-identity-in-code) | 45 min | Yes |
| 3 | [Database and storage on Supabase](#3-database-and-storage-on-supabase) | 20 min | Yes |
| 4 | [Deploy on Vercel](#4-deploy-on-vercel) | 15 min | Yes |
| 5 | [Fill in your content in the admin](#5-fill-in-your-content-in-the-admin) | 1–3 h | Yes |
| 6 | [Your domain](#6-your-domain) | 15 min, then up to a day for DNS | Recommended |
| 7 | [Secure the admin: password, then GitHub](#7-secure-the-admin-password-then-github) | 15 min | Recommended |
| 8 | [Search engines](#8-search-engines) | 30 min, then days or weeks to rank | Recommended |
| 9 | [Extras: coding activity, LeetCode sync, pet](#9-extras) | 10–30 min each | Optional |

Steps 0–4 have to be done in order. You can do 5–9 any time after the site is live.

---

## 0. Accounts and tools

**Accounts** (all have free tiers that are enough for a portfolio):

- **GitHub**: for your copy of the code.
- **Supabase**: Postgres database, file storage for images, and GitHub sign-in for the admin.
- **Vercel**: hosting. Every push to your main branch deploys automatically.
- **A domain** (optional): any registrar works.

**On your machine:** Node 20+, pnpm 9+ (`npm i -g pnpm`), Git, and Docker or a local PostgreSQL 14+.

## 1. Run it on your machine

```sh
git clone https://github.com/<you>/<your-repo>.git my-portfolio
cd my-portfolio
cp .env.example .env
```

Fill in `.env`:

| Variable | Value |
|---|---|
| `DATABASE_URL` | `postgres://postgres:password@127.0.0.1:5432/portfolio` for local Postgres |
| `PAYLOAD_SECRET` | output of `openssl rand -hex 32` |
| `PREVIEW_SECRET` | output of `openssl rand -hex 24` |
| `NEXT_PUBLIC_SERVER_URL` | `http://localhost:3000` |

Leave the storage and Supabase variables empty for now. Uploads then go to `public/media`, and the admin uses the password only.

```sh
docker run -d --name portfolio-db -p 5432:5432 -e POSTGRES_PASSWORD=password -e POSTGRES_DB=portfolio postgres:16
pnpm install
pnpm payload migrate     # creates every table
pnpm dev
```

Open http://localhost:3000/admin and create your admin user.

**Fastest way to your own content:** give an AI your résumé and [`content/site.json`](../content/site.json) with the prompt in [site.json](site-json.md), then import its answer (admin → Import & export, or `pnpm content:import`). Images can be links; they're downloaded for you.

**Don't run `pnpm seed` as is.** `src/seed/data.ts` holds the owner's real profile. Either rewrite that file with your details first (fast if you have a lot to enter), or skip it and type everything into the admin in step 5.

## 2. Replace the owner's identity in code

Most things are edited in the admin, but a few live in code because they are needed before the database is reachable, or are security settings. Search for them all with:

```sh
grep -rniE "sheetal|sheetaldharshan" src public --exclude-dir=migrations
```

| File | What to change |
|---|---|
| `src/config/admin.ts` | **Your** GitHub username and email. Only these may pass the admin's GitHub step or reset the password. |
| `src/data/seo.ts` | `SHORT_NAME`: the name people search for. Remove the `sheetal…dharshan` spacing rule in `brandName` or adapt it to your name. |
| `src/data/content.ts` | Fallback names and URL (used only before the admin's Site settings are filled in) |
| `src/globals/SiteSettings.ts`, `src/globals/About.ts` | Default name and canonical URL |
| `src/app/(frontend)/(site)/{projects,contact,research}/page.tsx` | Page descriptions for search results |
| `src/plugins/index.ts`, `src/payload.config.ts` | Title suffix used for SEO and in the admin tab |
| `src/components/avatar/InteractiveAvatar.tsx` | The avatar's accessible label |
| `src/data/activity.ts` | The `User-Agent` sent to GitHub and LeetCode (put your domain) |
| `public/site.webmanifest` | App name and short name |
| `public/icon*.png`, `favicon.ico`, `apple-touch-icon.png`, `icon.svg` | Your icons. You can also upload them later in **Site-wide → Favicon & icons**. |
| `public/pet/curly-hoodie.webp` | The pet is drawn from the owner. Replace it with your own sprite sheet (8 × 11 frames of 192 × 208 px), upload one in **Sidebar → Pet**, or switch the pet off there. |
| `src/utilities/indexNow.ts` and `public/<key>.txt` | Delete the owner's IndexNow key file; you'll make your own in step 8. |
| `redirects.ts` | Old URLs from the owner's previous site; remove the ones you don't need. |
| `vercel.json` | `regions`: the Vercel region closest to your Supabase database (`bom1` is Mumbai). |
| `README.md`, `docs/` | Your name and links |

Commit and push to your repository.

## 3. Database and storage on Supabase

1. **Create a project.** Pick the region closest to your visitors and save the database password.
2. **Connection string.** Project Settings → Database → Connection string → **Transaction pooler** (port 6543). That is your production `DATABASE_URL`. Use `DATABASE_POOL_MAX=2`, because serverless functions open many connections.
3. **Create the tables** from your machine, once:
   ```sh
   DATABASE_URL="<the pooler string>" pnpm payload migrate
   ```
   Against Supabase the app never changes the schema on its own; every change goes through `src/migrations`.
4. **Storage for images.** Storage → New bucket → `media`, set it to **Public**. Project Settings → Storage → S3 access keys → create a key. You'll need:
   `S3_BUCKET=media`, `S3_ENDPOINT=https://<ref>.storage.supabase.co/storage/v1/s3`, `S3_REGION=<region>`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, and `S3_PUBLIC_URL=https://<ref>.supabase.co/storage/v1/object/public/media`.
5. **For the admin's GitHub step** (step 7): `SUPABASE_URL=https://<ref>.supabase.co` and `SUPABASE_ANON_KEY` (Project Settings → API).

## 4. Deploy on Vercel

1. Vercel → Add New → Project → import your repository. Framework: Next.js.
2. Build command: `pnpm payload migrate && pnpm build`, so new migrations run on every deploy.
3. Environment variables (Production and Preview): everything from steps 1 and 3, with `NEXT_PUBLIC_SERVER_URL` set to your public address (`https://<project>.vercel.app` until you have a domain).
4. Deploy, open `https://<project>.vercel.app/admin`, and create your admin user, with a long password.

From now on, every push to the main branch redeploys.

## 5. Fill in your content in the admin

Do it in this order; later items reuse earlier ones. The admin's **Edit by page** menu follows the site's pages. The [admin guide](admin-guide.md) explains every screen.

1. **Site settings**: name, role, location, email, social links, résumé PDF, canonical URL.
2. **Appearance**: pick a theme preset or set your own colours and fonts.
3. **Profile**: Experience, Education, Certifications, Publications.
4. **Projects**: one per project, with a thumbnail, hero image or short video loop, and the story in blocks. Mark the best two or three as **Featured**.
5. **About**: intro (the first sentence is your pitch; keep it to what a recruiter should know in ten seconds), photo, technologies.
6. **Homepage conversation**: the chat bubbles on `/`, in your own voice.
7. **Navigation** (including its **Sidebar look**), **Pet**, and **Site-wide → Favicon & icons**.
8. **Posts**: optional articles at `/blog`.

Everything has **Save draft** and **Preview**; nothing goes public until you publish it.

## 6. Your domain

1. Vercel → Project → Settings → Domains → add `yourdomain.com` and `www.yourdomain.com`, and choose which one is primary.
2. At your registrar, add the records Vercel shows: usually an `A` record on the apex and a `CNAME` on `www`. Don't touch MX or TXT records you use for email.
3. Set `NEXT_PUBLIC_SERVER_URL=https://<your primary domain>` in Vercel and redeploy. Also set the same address under **Site settings → Canonical URL**.

HTTPS is issued automatically once DNS resolves (minutes, sometimes a few hours).

## 7. Secure the admin: password, then GitHub

Admin sign-in is two steps: the email and password, then a check that you are signed in to the GitHub account in `src/config/admin.ts`. A forgotten password is also reset through GitHub. The GitHub step switches itself on as soon as GitHub is enabled in Supabase.

1. **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**
   - Homepage URL: `https://<your domain>`
   - Authorization callback URL: `https://<ref>.supabase.co/auth/v1/callback`
   - Generate a client secret.
2. **Supabase → Authentication → Sign In / Providers → GitHub**: enable it and paste the client ID and secret.
3. **Supabase → Authentication → URL Configuration**
   - Site URL: `https://<your domain>`
   - Redirect URLs: `https://<your domain>/auth/callback` and `http://localhost:3000/auth/callback`
4. Make sure `SUPABASE_URL` and `SUPABASE_ANON_KEY` (or the `S3_*` variables) are set in Vercel.
5. Sign out of the admin and sign in again: after the password you'll be sent to GitHub, then back to the admin.

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

## 8. Search engines

1. **Google Search Console**: add your domain, verify it (a DNS record, or set `GOOGLE_SITE_VERIFICATION` in Vercel), then submit `https://<domain>/sitemap.xml`.
2. **Bing Webmaster Tools**: import from Google Search Console, or verify with `BING_SITE_VERIFICATION`. Bing also powers ChatGPT search and DuckDuckGo.
3. **IndexNow**: Bing gives you a key. Save it as `public/<key>.txt` with the key as its only content, and set `INDEXNOW_KEY` in `src/utilities/indexNow.ts`. Published changes are then announced automatically.
4. Link your site from GitHub, LinkedIn and other profiles. Links from places that already rank are what make a name search find you.

`/robots.txt`, `/sitemap.xml`, `/rss.xml`, `/llms.txt` (a summary for AI assistants) and structured data (Person, WebSite, breadcrumbs) are generated for you from your content.

## 9. Extras

- **Coding activity** (Sidebar → Coding activity): add your GitHub and LeetCode usernames. Choose whether each card appears in the sidebar and on About, and whether it starts open. The numbers are read from your public profiles and refreshed every 6 hours; no tokens needed.
- **LeetCode sync**: to keep your accepted solutions in a GitHub repository, create a repo with a workflow using [joshcai/leetcode-sync](https://github.com/joshcai/leetcode-sync) and add your `LEETCODE_SESSION` and `LEETCODE_CSRF_TOKEN` cookies as repository secrets. It runs on a schedule. It is separate from this site.
- **Pet** (Sidebar → Pet): turn it on or off, show it on phones, upload a sprite sheet, and set its behaviour: what it does when visitors go idle, come back, click it, drop it, or search.
- **Project videos**: upload a short MP4 loop to Media for the projects page, and use YouTube for long demos (paste the link in a project's **Demo video URL** field).

## Keeping it running

| When | What |
|---|---|
| Each new project or job | Add it in the admin. No code or deploy needed. |
| Every few months | Pull upstream fixes, run `pnpm install`, `pnpm typecheck` and `pnpm test:e2e`, then push. |
| Changing a CMS field in code | Follow the migration steps in [CONTRIBUTING](../CONTRIBUTING.md#changing-the-cms-schema). |
| Supabase free tier | The project pauses after a week with no traffic. The first visit afterwards is slow; upgrade or keep it busy if that matters. |
| A leaked key | Rotate it at the provider, update Vercel, and redeploy. |
