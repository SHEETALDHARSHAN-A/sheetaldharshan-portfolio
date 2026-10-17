# Contributing

Thanks for taking a look. This repository is the source of [sheetaldharshan.me](https://www.sheetaldharshan.me): a personal portfolio built with Next.js and Payload CMS. Bug reports, accessibility fixes, performance improvements and small features that make the template easier to reuse are all welcome.

Want to use it for **your own** portfolio instead? Start with [Make it yours](docs/make-it-yours.md).

## Before you start

- **Open an issue first** for anything bigger than a small fix. Describe the problem or idea, and include a screenshot or recording for visual changes.
- **Content is not open for contributions.** Text about the owner (About, projects, experience, publications) lives in the CMS and is kept to verified, public facts. Pull requests that change it will be closed.
- **Security problems** should not go in a public issue. Email the address on the [contact page](https://www.sheetaldharshan.me/contact) instead.

## Set up

You need Node 20+, pnpm 9+, and PostgreSQL 14+ (local Postgres, Docker, or a free Supabase project).

```sh
git clone https://github.com/SHEETALDHARSHAN-A/sheetaldharshan-portfolio.git
cd sheetaldharshan-portfolio
cp .env.example .env          # set DATABASE_URL, PAYLOAD_SECRET, PREVIEW_SECRET
pnpm install
pnpm payload migrate          # create the tables
pnpm seed                     # optional: sample content
pnpm dev                      # http://localhost:3000 and /admin
```

On an empty database, `/admin` asks you to create the first user. Locally, without Supabase variables, the GitHub sign-in step is off, so your password is enough.

No Postgres installed? Start one in Docker, which matches the default `DATABASE_URL` in `.env.example`:

```sh
docker run -d --name portfolio-db -p 5432:5432 -e POSTGRES_PASSWORD=password -e POSTGRES_DB=sheetaldharshan postgres:16
```

## Where things live

| Path | What it holds |
|---|---|
| `src/app/(frontend)` | Public pages, plus the `/auth` routes for admin sign-in |
| `src/app/(payload)` | The Payload admin and API (generated; rarely edited) |
| `src/collections`, `src/globals` | CMS schema: one file per collection or global |
| `src/data` | Server-side loaders that read Payload and shape data for pages |
| `src/components` | UI: `home/` (homepage conversation), `projects/`, `pet/`, `activity/`, `admin/` (custom admin parts) |
| `src/migrations` | Database migrations; one `.ts` and one `.json` snapshot per change |
| `src/proxy.ts` | Two-step admin sign-in (password, then GitHub) |
| `src/styles/theme.ts` | Turns admin theme settings into CSS variables |
| `tests/e2e` | Playwright tests for the public site |
| `docs/` | Architecture, CMS schema, admin guide, deployment |

## Making a change

1. Create a branch from `master`: `git checkout -b fix/short-description`.
2. Keep the change focused. Match the code around it: naming, comment style, and CSS variables (never hard-coded colours).
3. Run the checks:
   ```sh
   pnpm typecheck
   pnpm lint
   pnpm test:e2e -- tests/e2e/public.e2e.spec.ts
   ```
   Add or update a Playwright test when you change behaviour people can see.
4. Open a pull request against `master`. Say what changed, why, and how you checked it. For visual changes, include before and after screenshots at desktop (1440 px) and phone (390 px) widths.

### Changing the CMS schema

Adding or changing a field in `src/collections` or `src/globals` needs a migration. Production never changes its schema automatically.

```sh
pnpm generate:types                     # refresh src/payload-types.ts
pnpm payload migrate:create short_name  # writes src/migrations/<timestamp>_short_name.{ts,json}
```

Then:

- **Read the generated SQL.** It should only contain your change. If it repeats older changes, it was compared against the wrong snapshot (see the next point).
- **Keep migrations in date order.** `migrate:create` names files with a UTC timestamp, which can sort before newer hand-named files. Rename the `.ts` and `.json` pair so the new one sorts last, and update its entry at the end of `src/migrations/index.ts`.
- **New tables need row-level security.** End the `up` SQL with `ALTER TABLE "<table>" ENABLE ROW LEVEL SECURITY;`. Supabase's public REST API then can't read the table, while Payload (the table owner) still can.
- Run `pnpm payload migrate` locally, and commit the `.ts`, the `.json` and `index.ts` together.

### Commit messages

Write a short summary line in plain English that says what changed for the reader ("Pet behaviours in the admin"). Add a body when the reason isn't obvious. No ticket numbers or tool footers.

## Rules that keep the site healthy

- **Never commit secrets.** `.env` is ignored; keys belong in the hosting provider's settings. If you commit one by accident, rotate it. Removing it from history is not enough.
- **No new runtime dependencies** without a reason in the PR description. Most UI here is plain React and CSS.
- **Respect reduced motion.** Every animation needs a `prefers-reduced-motion` path.
- **Accessibility:** interactive elements are real buttons or links, keyboard focus is visible, and images have alt text.
- **Performance:** public pages are statically rendered and revalidated (`revalidate = 300`). Don't read cookies or headers in public pages; that makes them dynamic.

## Licence

There is no open-source licence yet. Until one is added, the code is the owner's and may not be reused without permission; a pull request does not change that. The homepage reproduces the measurements and timing of [juliangarnier.com](https://juliangarnier.com) (CC BY-NC 4.0) in an independent implementation; credit that site in any derivative, and do not use that part commercially.
