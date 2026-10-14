# Deployment

## Supabase (chosen database)

1. Create a project at supabase.com. Note the database password you set.
2. Project Settings → Database → Connection string → **Session pooler** (port 5432). Use that as `DATABASE_URL`. The transaction pooler (6543) does not support the prepared statements Payload's adapter uses. TLS is switched on automatically for `*.supabase.co` hosts.
3. Media: Storage → New bucket `media`, public. Project Settings → Storage → S3 access keys → create a key. Set `S3_BUCKET=media`, `S3_ENDPOINT=https://<project-ref>.storage.supabase.co/storage/v1/s3`, `S3_REGION=<project region>`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`. Leave `BLOB_READ_WRITE_TOKEN` empty.
4. Schema: run `pnpm payload migrate` with the Supabase `DATABASE_URL` (locally once, or as part of the build command). The committed migration in `src/migrations/` creates every table; production never pushes schema changes automatically.
5. Content: `pnpm seed` with the Supabase `DATABASE_URL` loads the verified starter content, or enter it in the admin.
6. Open `/admin` on the deployed site and create the first user.

Supabase's free tier pauses projects after a week without traffic; the first request afterwards is slow while it resumes. Upgrade or keep a ping if that matters.

## Production architecture
- **App**: Next.js 16 + Payload on Vercel (Node 20+). One deployment serves the site, `/admin` and `/api`.
- **Database**: Supabase Postgres (session pooler). Any managed Postgres works the same way.
- **Media**: Supabase Storage through the S3 adapter (`S3_*` variables) or Vercel Blob (`BLOB_READ_WRITE_TOKEN`); whichever is configured activates. Uploads must not rely on the deployment filesystem.
- **Domain**: `sheetaldharshan.me` canonical, `www` redirects to it.

## Environment variables
From `.env.example`:

| Name | Purpose |
|---|---|
| `DATABASE_URL` | Supabase session-pooler connection string |
| `DATABASE_SSL` | `true` to force TLS on hosts not recognised automatically |
| `S3_BUCKET`, `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | Supabase Storage (S3 endpoint) for media |
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

The initial migration (`src/migrations/20261014_182700_initial.ts`) creates every table and was verified against an empty database.

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
