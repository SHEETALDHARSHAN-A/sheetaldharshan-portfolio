# sheetaldharshan.me

Personal portfolio, project showcase, and publishing platform for Sheetaldharshan A.

The project is a single Next.js App Router application with Payload CMS mounted at `/admin`, PostgreSQL persistence, Lexical rich text, draft/version workflows, and a deliberately editorial public frontend. The visual language combines a sequenced conversation on the homepage with an interactive project explorer.

## Stack

- Next.js 16 + React 19 + TypeScript
- Payload CMS 3.90 with PostgreSQL adapter
- Tailwind CSS and CSS variables
- Lexical rich text editor
- pnpm
- Playwright, Vitest, and Vercel-compatible deployment

## Local setup

```bash
cp .env.example .env
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) for the website and [http://localhost:3000/admin](http://localhost:3000/admin) for Payload. The first visit to `/admin` creates the initial administrator. Do not commit `.env` or real credentials.

The public visual shell has a verified fallback dataset in `src/data/site.ts` so it can be inspected before PostgreSQL is provisioned. Payload collections and globals are ready in `src/collections` and `src/globals`; use the admin panel for persisted content once `DATABASE_URL` is available.

## Commands

```bash
pnpm dev
pnpm exec tsc --noEmit
pnpm lint
pnpm exec next build --webpack
pnpm test:int
pnpm test:e2e
pnpm payload generate:types
pnpm payload migrate:create
pnpm payload migrate
```

The template ESLint command currently trips a circular-config error in the installed ESLint 9 compatibility layer; TypeScript and the production webpack build are passing. See the implementation notes in `docs/` for the current scope and next integration steps.

## CMS workflow

- Edit homepage conversation messages under the Homepage global.
- Create reviewed Projects and Publications with draft/version support.
- Use Posts for articles; drafts are not public.
- Use Appearance for whitelisted design presets rather than arbitrary CSS.
- Keep incomplete or confidential material unpublished.

## Documentation

- [Reference analysis](docs/reference-analysis.md)
- [Design spec](docs/design-spec.md)
- [Animation spec](docs/animation-spec.md)
- [Architecture](docs/architecture.md)
- [CMS schema](docs/cms-schema.md)
- [Implementation plan](docs/implementation-plan.md)
- [Admin guide](docs/admin-guide.md)
- [Deployment](docs/deployment.md)
