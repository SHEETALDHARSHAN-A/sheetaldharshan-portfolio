import { postgresAdapter } from '@payloadcms/db-postgres'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { s3Storage } from '@payloadcms/storage-s3'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Projects } from './collections/Projects'
import { Experience } from './collections/Experience'
import { Education } from './collections/Education'
import { Certifications } from './collections/Certifications'
import { Publications } from './collections/Publications'
import { Users } from './collections/Users'
import { Messages } from './collections/Messages'
import { KbComments, KbFeedback, KbReports, KbReviews, KbSettings, KbVotes, ReaderLinks, ReaderLists, Readers } from './collections/KnowledgeBase'
import { contact, contactTest } from './endpoints/contact'
import { kbEndpoints } from './endpoints/kb'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { Appearance } from './globals/Appearance'
import { Homepage } from './globals/Homepage'
import { SiteSettings } from './globals/SiteSettings'
import { CodingActivity } from './globals/CodingActivity'
import { Pet } from './globals/Pet'
import { Brand } from './globals/Brand'
import { ProjectsPage } from './globals/ProjectsPage'
import { Navigation } from './globals/Navigation'
import { About } from './globals/About'
import { AdminLook } from './globals/AdminLook'
import { AdminSecurity } from './globals/AdminSecurity'
import { ContactPage } from './globals/ContactPage'
import { adminSearch } from './endpoints/adminSearch'
import { siteJson } from './endpoints/siteJson'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    meta: {
      titleSuffix: ' · sheetaldharshan.me',
      icons: [
        { rel: 'icon', type: 'image/svg+xml', url: '/icon.svg' },
        { rel: 'apple-touch-icon', url: '/apple-touch-icon.png' },
      ],
    },
    // Logo, menu icon, avatar, colours and font from Site-wide → Admin look (SD logo by default).
    avatar: { Component: '@/components/admin/AdminBrand#AdminAvatar' },
    components: {
      header: ['@/components/admin/AdminBrand#AdminTheme'],
      // Top bar, left of the account avatar: Export (full backup) and Import.
      actions: ['@/components/admin/HeaderActions#HeaderActions'],
      // Admin panel → Import & export: the whole site as one JSON file.
      views: { siteData: { Component: '@/components/admin/SiteDataView#SiteDataView', path: '/site-data' } },
      graphics: {
        Logo: '@/components/admin/AdminBrand#AdminLogo',
        Icon: '@/components/admin/AdminBrand#AdminIcon',
      },
      // The admin menu, page by page in the site's order (projects listed one by one).
      beforeNavLinks: ['@/components/admin/NavResizer#NavResizer', '@/components/admin/AdminSearch#AdminSearch', '@/components/admin/EditByPage#EditByPage'],
      // A note on the two-step sign-in above the password form, and a sign-out that ends the whole session.
      beforeLogin: ['@/components/admin/GitHubSignIn#GitHubSignIn'],
      logout: { Button: '@/components/admin/SignOut#SignOut' },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      // Managed Postgres (Supabase, Neon, RDS) requires TLS; local Postgres does not.
      ssl: process.env.DATABASE_SSL === 'true' || /supabase\.co|neon\.tech|\.rds\.amazonaws\.com/.test(process.env.DATABASE_URL || '') ? { rejectUnauthorized: false } : undefined,
      max: Number(process.env.DATABASE_POOL_MAX || 10),
      // Serverless functions are frozen between requests while Supabase drops idle connections, so a
      // kept connection can be dead when the function wakes and a query on it would hang. Drop idle
      // connections quickly, keep sockets alive, and fail fast instead of waiting forever.
      idleTimeoutMillis: 5_000,
      // Includes waiting for a free connection when the pool is busy, so it is generous.
      connectionTimeoutMillis: 30_000,
      keepAlive: true,
      query_timeout: 20_000,
    },
    migrationDir: path.resolve(dirname, 'migrations'),
    // Production never pushes schema changes; it runs the committed migrations.
    // Dev push only against a local database; shared databases (Supabase) change through migrations.
    push: process.env.NODE_ENV !== 'production' && !/supabase\.(co|com)/.test(process.env.DATABASE_URL || ''),
  }),
  collections: [Projects, Posts, Pages, Publications, Experience, Education, Certifications, Media, Categories, KbComments, KbReviews, KbFeedback, KbReports, KbVotes, Readers, ReaderLists, ReaderLinks, Messages, Users],
  cors: [getServerSideURL()].filter(Boolean),
  // Order sets the admin menu: Sidebar, Brand, then Pages.
  globals: [SiteSettings, Navigation, Pet, CodingActivity, Brand, Appearance, AdminLook, AdminSecurity, Homepage, ProjectsPage, About, ContactPage, KbSettings],
  // The admin's search bar (src/components/admin/AdminSearch.tsx).
  // Only the REST API is used; GraphQL (and its playground) is switched off to keep the surface small.
  graphQL: { disable: true },
  endpoints: [adminSearch, ...siteJson, contact, contactTest, ...kbEndpoints],
  plugins: [
    ...plugins,
    // Persistent media in production. Enabled only when a Vercel Blob token is present; local dev writes to public/media.
    vercelBlobStorage({
      enabled: !!process.env.BLOB_READ_WRITE_TOKEN,
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
    // Supabase Storage through its S3-compatible endpoint. Enabled when S3_BUCKET is set.
    s3Storage({
      enabled: !!process.env.S3_BUCKET,
      collections: {
        media: {
          prefix: 'media',
          // Serve files straight from Supabase's public CDN instead of proxying them through the app.
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) =>
            `${process.env.S3_PUBLIC_URL || ''}/${[prefix, filename].filter(Boolean).join('/')}`,
        },
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION || 'us-east-1',
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
          // Supabase session-token auth: access key = project ref, secret = anon key, session token = service role key.
          ...(process.env.S3_SESSION_TOKEN ? { sessionToken: process.env.S3_SESSION_TOKEN } : {}),
        },
      },
    }),
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [],
  },
})
