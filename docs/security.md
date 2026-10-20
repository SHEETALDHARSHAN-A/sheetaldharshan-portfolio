# Security and privacy

How the site protects the admin, readers and their data, and what to keep in mind when changing it. The public privacy notice is at `/privacy` (`src/app/(frontend)/(site)/privacy/page.tsx`); update it whenever what is collected changes.

## Admin
- **Two steps:** a password, then GitHub (`src/proxy.ts`, `src/utilities/secondFactor.ts`). Without the GitHub step the Payload session is hidden from the admin and its API.
- **Lockout:** five wrong passwords lock the account for 15 minutes. Sessions expire after 8 hours of inactivity, with secure, SameSite cookies (`src/collections/Users`).
- **Every Payload collection and global** has explicit access rules. Public globals hide private fields with `privateFields()` (`src/access/privateFields.ts`), for example the Contact page alert addresses and templates, and ./stdout moderation.
- **GraphQL is switched off;** only the REST API exists.

## Readers (./stdout)
- **Sign-in:** GitHub (through Supabase) or a one-time email link. There are no passwords.
  - An email link works once, for 15 minutes, and only a SHA-256 hash of it is stored.
  - Opening the link shows a confirm button. Mail scanners that open links can't use it up.
  - **Cross-device:** the browser that asks for a link gets a random secret in an httpOnly `reader_link` cookie (only its hash is stored). Opening the link on another device only *approves*. The asking browser polls `/api/kb/email-link-status`, then claims the session once. Opening it in the asking browser signs in directly.
  - Sign-in redirects only go to paths on this site (`safeNext`).
- **Sessions:** an HS256 token in the httpOnly, Secure, SameSite=Lax `reader_session` cookie (`src/utilities/readerSession.ts`).
  - The key is derived from `PAYLOAD_SECRET` and kept separate from admin tokens.
  - The algorithm and expiry are checked on every request.
  - The token carries the reader's session version, so blocking a reader or "sign out on all devices" ends every session at once.
- **Cross-site writes are refused** (`src/utilities/sameOrigin.ts`). Every write must be JSON from a page on this site (checked via `Sec-Fetch-Site` and `Origin`), which a form on another site can't send.
- **Rate limits** are counted in the database, so they hold across all serverless instances. People who aren't signed in are counted by a keyed hash of their IP address (`ipHash`), never the address itself.
- **Content checks** run on all text (`src/utilities/moderation.ts`): abuse is refused, doubtful text is held. Everything is rendered as text, never HTML.
- **Readers' own data:** they can download it (`/api/kb/my-data`) and delete their account (`/api/kb/delete-account`) from `/notes/me`.

## Browser protections
`securityHeaders.ts` sets these on every response:
- HSTS (two years, with preload).
- `nosniff`, a strict referrer policy and `X-Frame-Options: SAMEORIGIN`.
- `Cross-Origin-Opener-Policy`, and a Permissions-Policy that turns off the camera, microphone, location and payment features.

The public site also gets a **content security policy**:
- Scripts and connections are allowed only from this site.
- Frames only from YouTube (no-cookie), Vimeo, Spotify and SoundCloud.
- Forms post only here, and no plugins are allowed.

When you add a new outside service (an embed, fonts, an API called from the browser), add it to that policy, or the browser will block it.

Admin, API, sign-in and reader pages are `noindex`, and sign-in responses are never cached.

## Database and storage
- **Row-level security** is on for every table in Supabase, with no policies, so the public (anon) key can't read anything through Supabase's API. Turn it on for each new table too. The migration steps in [CONTRIBUTING](../CONTRIBUTING.md) do this.
- **Secrets** live only in Vercel environment variables and your local `.env`, which is git-ignored. Never commit them.

## HTTPS everywhere (HSTS preload)
`src/proxy.ts` redirects the bare domain to `www` (taken from `NEXT_PUBLIC_SERVER_URL`) and sets the full HSTS header on that redirect. This is because hstspreload.org checks the bare domain, and Vercel's own domain redirect only sends a short header.

For this to work, in Vercel the bare domain must point at the project (**Connect to an environment: Production**), not at "Redirect to www…".

Once it is on the preload list, every subdomain must serve HTTPS for good. Removal takes months, so check before adding web subdomains. Mail-only DNS records such as Resend's are unaffected.

## Dependencies
- Run `pnpm audit --prod` regularly and upgrade what it flags. Dependabot alerts on GitHub do this automatically (repository → Settings → Code security).
- **Waiting on a fix:** `braces` (high, build-time file watcher only; no patched release yet). When `pnpm view braces version` shows 3.0.4 or later, add `braces@<3.0.4: ^3.0.4` under `overrides` in `pnpm-workspace.yaml`, then run `pnpm install` and `pnpm audit --prod`.
- `pnpm-workspace.yaml` → `overrides` pins patched versions of vulnerable sub-dependencies until their parents ship them. Remove a pin once the parent package includes the fix.

## Checklist for changes
- [ ] A new collection or global: access rules set; private fields wrapped in `privateFields`; row-level security on its table.
- [ ] A new endpoint that writes: `sameOrigin(req)`, a sign-in check where needed, a database-backed rate limit, `moderate()` on any text.
- [ ] A new outside service: added to the content security policy, and to the privacy notice.
- [ ] New personal data collected: listed on `/privacy`, included in the reader data export, and removed on account deletion.
