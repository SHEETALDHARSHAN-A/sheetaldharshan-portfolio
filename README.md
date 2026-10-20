# sheetaldharshan.me

Personal portfolio, project showcase and publishing platform for Sheetaldharshan A. One Next.js application with Payload CMS at `/admin` and PostgreSQL behind it. Content, navigation, appearance and pages are managed from the admin; ordinary updates never need a code change.

## Stack
Next.js 16 (App Router) · React 19 · TypeScript · Payload CMS 3.90 · PostgreSQL (Supabase in production) · Lexical rich text · anime.js (homepage motion) · Tailwind v4 utilities + CSS custom properties · pnpm · Playwright + Vitest · Vercel-compatible.

## Prerequisites
Node 20+, pnpm 9+, PostgreSQL 14+ reachable from `DATABASE_URL`.

## Local setup
```sh
cp .env.example .env        # fill in DATABASE_URL, PAYLOAD_SECRET, PREVIEW_SECRET
pnpm install
pnpm payload migrate        # create the tables
pnpm seed                   # verified starter content (safe to re-run)
pnpm dev                    # http://localhost:3000 and http://localhost:3000/admin
```
The first visit to `/admin` asks you to create the administrator. No credentials are hardcoded anywhere.

## Commands
```sh
pnpm dev            # development server
pnpm typecheck      # tsc --noEmit
pnpm lint           # eslint
pnpm build          # production build
pnpm start          # serve the production build
pnpm seed           # seed or refresh the verified content
pnpm test:int       # vitest integration tests (needs the database)
pnpm test:e2e       # playwright end-to-end tests (starts or reuses the dev server)
pnpm payload generate:types
pnpm payload migrate:create && pnpm payload migrate
```

## How it is organised
See `docs/architecture.md`. Short version: pages under `src/app/(frontend)` read Payload through `src/data/content.ts`; the homepage is a server-rendered conversation animated by `src/components/home/ConversationPlayer.tsx`; projects use `src/components/projects/ProjectExplorer.tsx`; CMS blocks render through `src/components/blocks/RenderProjectBlocks.tsx`.

## Documentation
- **[Make it yours](docs/make-it-yours.md)**: use this as your own portfolio, step by step · **[site.json](docs/site-json.md)**: the whole site in one file, AI-ready · **[Contributing](CONTRIBUTING.md)**
- [Reference analysis](docs/reference-analysis.md) · [Design spec](docs/design-spec.md) · [Animation spec](docs/animation-spec.md)
- [Architecture](docs/architecture.md) · [CMS schema](docs/cms-schema.md) · [Implementation plan and status](docs/implementation-plan.md)
- [Admin guide](docs/admin-guide.md) · [Deployment](docs/deployment.md) · [Security and privacy](docs/security.md) · [Visual QA report](docs/visual-qa-report.md)

## Content rules
Only verified, public information goes into the CMS. Private company work is summarised at a high level with no links. Drafts stay private until published. The seed in `src/seed/data.ts` is the reviewed baseline.

## Licence and third-party notes
Application code is the owner's. The homepage reproduces the measurements and timing of juliangarnier.com (CC BY-NC 4.0) in an independent implementation; no file, image or text from that repository is included. anime.js is MIT. Fonts: Inter and Barlow Condensed (Google Fonts, OFL), Geist (Vercel, OFL).
