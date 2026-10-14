# Implementation plan and status

| Phase | Status | Notes |
|---|---|---|
| 1 Research | done | reference-analysis.md, design-spec.md, animation-spec.md. Both recordings analysed frame by frame; the juliangarnier.com source was read for exact values. |
| 2 Architecture | done | architecture.md, cms-schema.md. Payload 3.90.2, Next 16.3.3, React 19.2, pnpm 11. |
| 3 Foundation | done | Starts locally against PostgreSQL 5432; `/admin` works. |
| 4 CMS | done | All collections and globals, drafts, versions, live preview, media with size variants, reserved-slug guard. |
| 5 Homepage | done | Reference-exact conversation with anime.js; CMS-driven messages, choices, presets; no-JS and reduced-motion fallbacks. |
| 6 Projects | done | Explorer (list + stage), grid alternative, case-study pages with ordered blocks, next-project footer. |
| 7 Blog | done | List with search and categories, articles with cover, related posts, reading time, RSS, JSON-LD. Markdown import is not built: paste into the Lexical editor. |
| 8 Pages | done | About (sectioned, CMS-ordered), Research, Contact, dynamic `/[slug]` pages, 404. |
| 9 Admin polish | done | Row labels on arrays, grouped sidebar ("Profile"), live preview URLs with draft mode, Appearance presets applied via data attributes. |
| 10 QA | done | `pnpm typecheck` clean, `pnpm lint` 0 errors, `pnpm build` passes (all routes dynamic). Playwright: 21/21 (public suite 12, admin scenarios A–F plus login, access control and reserved-slug checks: 9). Vitest integration: content persistence in PostgreSQL. Visual QA in visual-qa-report.md. |
| 11 Production | documented | deployment.md: Vercel + managed Postgres + Vercel Blob, DNS steps, migrations, backups. Not deployed from here. |
