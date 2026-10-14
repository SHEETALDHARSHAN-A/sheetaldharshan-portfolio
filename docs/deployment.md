# Deployment

Use a Vercel-compatible Next.js host, managed PostgreSQL, and persistent object storage for media. Configure `DATABASE_URL`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`, and any storage credentials only in the hosting provider. Run Payload migrations before serving traffic. Point `sheetaldharshan.me` and `www.sheetaldharshan.me` at the provider's current documented records, then configure `www` to redirect to the canonical origin. Do not change unrelated DNS records.
