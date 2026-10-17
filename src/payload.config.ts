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

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    meta: { titleSuffix: ' · sheetaldharshan.me' },
    components: {
      // The admin menu, page by page in the site's order (projects listed one by one).
      beforeNavLinks: ['@/components/admin/EditByPage#EditByPage'],
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
    },
    migrationDir: path.resolve(dirname, 'migrations'),
    // Production never pushes schema changes; it runs the committed migrations.
    // Dev push only against a local database; shared databases (Supabase) change through migrations.
    push: process.env.NODE_ENV !== 'production' && !/supabase\.(co|com)/.test(process.env.DATABASE_URL || ''),
  }),
  collections: [Projects, Posts, Pages, Publications, Experience, Education, Certifications, Media, Categories, Users],
  cors: [getServerSideURL()].filter(Boolean),
  // Order sets the admin menu: Sidebar, Brand, then Pages.
  globals: [SiteSettings, Navigation, Pet, CodingActivity, Brand, Appearance, Homepage, ProjectsPage, About],
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
