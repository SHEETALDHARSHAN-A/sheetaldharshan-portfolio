# Deployment

## Production architecture
- **App**: Next.js 16 + Payload on Vercel (Node 20+). One deployment serves the site, `/admin` and `/api`.
- **Database**: managed PostgreSQL (Neon, Supabase, Railway, RDS or Vercel Postgres). SSL on.
- **Media**: Vercel Blob (`BLOB_READ_WRITE_TOKEN`). The adapter is already wired and activates when the token exists. Uploads must not rely on the deployment filesystem.
- **Domain**: `sheetaldharshan.me` canonical, `www` redirects to it.

## Environment variables
From `.env.example`:

| Name | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string with `?sslmode=require` on managed hosts |
| `PAYLOAD_SECRET` | 32+ random bytes, `openssl rand -hex 32` |
| `PREVIEW_SECRET` | random string protecting draft preview |
| `NEXT_PUBLIC_SERVER_URL` | `https://sheetaldharshan.me` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token for persistent uploads |
| `CRON_SECRET` | only if scheduled jobs are enabled |

Never commit `.env`. Set the values in the hosting dashboard.

## Database migrations
Development pushes the schema automatically. Production must use migrations:

```sh
pnpm payload migrate:create   # once per schema change, commit the files in src/migrations
pnpm payload migrate          # run during deploy (Vercel build command: pnpm payload migrate && pnpm build)
```

The first production migration creates every table. If `src/migrations` is empty, create it from a clean local database before the first deploy.

## Steps
1. Create the Postgres database; copy its connection string.
2. Create a Vercel project from the repository. Framework: Next.js. Install command `pnpm install`. Build command `pnpm payload migrate && pnpm build`.
3. Add the environment variables above. Add a Vercel Blob store and attach its token.
4. Deploy. Open `https://<project>.vercel.app/admin` and create the first user.
5. Run `pnpm seed` locally against the production `DATABASE_URL` once if you want the verified starter content, or enter it by hand in the admin.
6. Add the domain in Vercel → Settings → Domains: `sheetaldharshan.me` and `www.sheetaldharshan.me`, with `www` set to redirect to the apex.
7. Set `NEXT_PUBLIC_SERVER_URL=https://sheetaldharshan.me` and redeploy.

## DNS
Use the records Vercel shows for the domain at the time of setup; do not copy values from this document. Typically an `A` record on the apex and a `CNAME` on `www`. Change only those two records. Leave MX, TXT and any email-related records untouched.

## HTTPS
Vercel issues and renews certificates automatically once DNS resolves. Verify `https://sheetaldharshan.me` and that `http://` and `www` redirect.

## Verification checklist
- `/` loads with the conversation; `/projects`, `/blog`, `/about`, `/research`, `/contact` render.
- `/admin` requires login; anonymous `POST /api/projects` returns 401/403.
- Upload an image in Media and open its URL after a redeploy (persistence).
- `/sitemap.xml`, `/rss.xml`, `/robots.txt` use the production domain.
- Social preview: paste a project URL into a link preview checker.

## Backups and recovery
- Database: enable the provider's automatic backups (daily, 7+ days retention). Manual: `pg_dump "$DATABASE_URL" > backup.sql`.
- Media: Vercel Blob is durable; export with the Vercel CLI if you need an offline copy.
- Recovery: restore the database dump, redeploy the same commit, confirm `/admin` login and one project page.

## Other hosts
Any Node host works (Railway, Fly, a VPS with `pnpm build && pnpm start`). Replace Vercel Blob with `@payloadcms/storage-s3` if the host has no Blob; set `images.remotePatterns` in `next.config.ts` for the bucket host.
