# Architecture

The application is a single Next.js App Router project with Payload mounted under `/admin` and `/api`. The public frontend uses server-rendered route pages and small client components only where interaction is required (the homepage conversation and project explorer). Payload provides authentication, drafts, versions, media, and PostgreSQL persistence.

The current public route slice has a verified content fallback in `src/data/site.ts` so the visual shell can be run before a local PostgreSQL database is provisioned. The corresponding Payload collections and globals are defined in `src/collections` and `src/globals`; the next integration step is to replace fallback reads with published Payload queries and seed the verified entries.
