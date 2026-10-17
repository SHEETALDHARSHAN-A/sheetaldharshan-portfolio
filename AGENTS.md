<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Working on this repository

A personal portfolio: **Next.js 16** (App Router) + **Payload CMS 3.90** (admin at `/admin`, REST at `/api`) + **Postgres** (Supabase in production) + **Supabase Storage** for media, deployed on **Vercel** (a push to `master` deploys). Almost everything a visitor sees is edited in the admin; code changes are for new features.

Start here: [README](README.md) · [CONTRIBUTING](CONTRIBUTING.md) · [Make it yours](docs/make-it-yours.md) · [site.json](docs/site-json.md) · [Admin guide](docs/admin-guide.md) · [Deployment](docs/deployment.md).

## Commands

| Task | Command |
|---|---|
| Run locally | `pnpm dev` (site on :3000, admin on /admin) |
| Check | `pnpm typecheck` · `pnpm lint` · `pnpm test:e2e -- tests/e2e/public.e2e.spec.ts` |
| After changing CMS fields | `pnpm generate:types` |
| After adding or moving admin components | `pnpm payload generate:importmap` |
| Schema migration | `pnpm payload migrate:create <name>` then `pnpm payload migrate` (see below) |
| Whole site as one file | `pnpm content:export [file]` · `pnpm content:import <file> [--dry-run]` |
| Locked out of the admin | `pnpm admin:reset-password` |

Scripts read `.env`, and `DATABASE_URL` there may be the **live** database. Treat anything that writes to it as a production change.

## Where things live

| Path | What it is |
|---|---|
| `src/app/(frontend)/(site)/…` | Public pages (projects, blog, about, research, contact) |
| `src/app/(frontend)/auth/…` | Admin sign-in step two (GitHub via Supabase), password reset, sign-out |
| `src/proxy.ts` | Next 16 "proxy" (was middleware): enforces the GitHub step for the admin |
| `src/collections/`, `src/globals/` | CMS schema. Globals are settings pages; collections are lists of entries |
| `src/data/*.ts` | Server loaders: read Payload, validate, shape data for pages (`content.ts`, `brand.ts`, `activity.ts`, `adminLook.ts`) |
| `src/components/` | UI. `home/` homepage conversation, `projects/`, `pet/` sidebar pet, `activity/` GitHub and LeetCode cards, `admin/` custom admin parts |
| `src/endpoints/` | Custom API routes: `adminSearch` (admin search box), `siteJson` (import and export) |
| `src/utilities/siteData.ts` | site.json export and import (config-driven) |
| `src/utilities/secondFactor.ts` | Signed cookie and on/off logic for the GitHub step |
| `src/styles/theme.ts` | Admin theme settings turned into CSS variables (whitelisted values only) |
| `src/migrations/` | One `.ts` and `.json` pair per schema change, listed in `index.ts` |
| `content/site.json` | Example export of the whole site |
| `tests/e2e/` | Playwright tests (they start or reuse `pnpm dev`) |

## Recipes

**Add a setting to an existing settings page** (for example a new option on the pet):
1. Add the field in `src/globals/<Page>.ts`. Give it a `label`, a `defaultValue` and an `admin.description` in plain words.
2. Read it in the loader in `src/data/` and **validate** it there (colours `#rrggbb` only, numbers clamped, selects checked against their options). Pass it to the component.
3. `pnpm generate:types`, then make a migration (below).
4. Nothing else: the admin search, the Edit by page menu ("More") and site.json pick up new fields automatically.

**Add a new settings page or collection:** create it in `src/globals/` or `src/collections/`, register it in `src/payload.config.ts`, set `admin.group`, and add a link in `src/components/admin/EditByPage.tsx` (anything left out appears under "More"). For a content collection that should travel in site.json, add its slug to `COLLECTIONS` in `src/utilities/siteData.ts`, ordered after anything it links to.

**Schema migration:**
1. `pnpm payload migrate:create <name>`. Pipe newlines (`printf '\n\n\n' | …`) if it waits on a rename prompt.
2. **Read the SQL.** It should contain only your change.
3. It names files with a UTC timestamp that can sort before newer files. Rename the `.ts` and `.json` pair so it sorts last (`YYYYMMDD_HHMMSS_name`), and move its entry to the end of `src/migrations/index.ts`.
4. New tables end with `ALTER TABLE "<table>" ENABLE ROW LEVEL SECURITY;`.
5. Apply with `pnpm payload migrate`, and commit all three files together.

**Add an admin UI piece:** a server component by default; add `'use client'` only when it needs state. Register it in `payload.config.ts` (`admin.components.*`) or a field's `admin.components.Field`, then run `pnpm payload generate:importmap`. Use Payload's CSS variables (`--theme-elevation-*`, `--theme-text`, `--theme-success-500`) so it follows the admin theme.

**Change content in bulk:** export site.json, edit it (or have an AI edit it; the prompt is in `src/utilities/siteJsonPrompt.ts`), then `pnpm content:import <file> --dry-run`, then import for real.

## Rules

- **Facts only.** Content about the owner must be verified and public. Never invent jobs, numbers, dates, achievements or links.
- **Never commit secrets** (`.env`, keys, tokens). Configuration goes in Vercel's environment variables.
- **Commits:** a plain summary line that says what changed for a reader, a body when the reason isn't obvious, and **no AI or tool attribution footers**. Push only when typecheck, lint and the e2e tests pass.
- **Public pages stay static**: `revalidate = 300`. Don't read cookies or headers in them. Saving in the admin refreshes affected paths through `src/hooks/revalidate.ts`.
- **Anything from the admin is validated before it reaches CSS or HTML** (see `src/styles/theme.ts`, `hex()` in `src/data/content.ts`).
- **Motion respects `prefers-reduced-motion`**; interactive elements are real buttons or links with visible focus.
- Match the surrounding code: naming, comment density (comments explain *why*), CSS variables instead of hard-coded colours.

## Traps this codebase has already hit

- **The admin rebuilds its menu on every page.** Menu state (open groups, scroll position, width) lives in `localStorage` or `sessionStorage` (see `EditByPageTree.tsx`, `NavResizer.tsx`).
- **The admin menu clips overflow.** Pop-overs from it must be portalled to `document.body` (see `AdminSearch.tsx`).
- **Serverless and the database:** Vercel freezes functions while Supabase drops idle connections. The pool in `payload.config.ts` has short idle, connect and query timeouts; keep them, or requests hang for minutes.
- **The GitHub step:** without a valid `admin-2fa` cookie, `src/proxy.ts` strips `payload-token` from requests, so Payload sees no user. Run scripts with the Local API (`getPayload`), not by calling the live REST API.
- **Writing to an image upload** (for example its focal point) makes Payload regenerate every size in storage, which is slow. Store per-use settings on the page instead (see `photoFocalX` on About).
- **Payload's `migrate:create` can diff against the wrong snapshot** when filenames sort out of order. That's why the rename step exists.
- **React compiler lint:** don't reassign variables after render, or mutate during render. Compute with `reduce` or `slice` instead.

## For people who just want to update their portfolio with an AI

You don't need to touch code. In the admin, open **Admin panel → Import & export**. Download **site.json**, copy the prompt shown there, and give both to an AI along with your résumé or notes. Paste its answer back, click **Preview changes**, then **Import**. A **full backup (.zip)** from the same page (or the **Export** button in the top bar) also carries every image, for moving the site or restoring it.
