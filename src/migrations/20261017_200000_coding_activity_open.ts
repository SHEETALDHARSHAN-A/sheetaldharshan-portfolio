import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Whether each coding-activity card starts open, per place (sidebar logos, About page panels).
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "coding_activity" ADD COLUMN IF NOT EXISTS "github_sidebar_open" boolean DEFAULT false;
  ALTER TABLE "coding_activity" ADD COLUMN IF NOT EXISTS "github_about_open" boolean DEFAULT true;
  ALTER TABLE "coding_activity" ADD COLUMN IF NOT EXISTS "leetcode_sidebar_open" boolean DEFAULT false;
  ALTER TABLE "coding_activity" ADD COLUMN IF NOT EXISTS "leetcode_about_open" boolean DEFAULT true;
  UPDATE "coding_activity" SET "github_sidebar_open" = false, "github_about_open" = true, "leetcode_sidebar_open" = false, "leetcode_about_open" = true;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "coding_activity" DROP COLUMN "github_sidebar_open";
  ALTER TABLE "coding_activity" DROP COLUMN "github_about_open";
  ALTER TABLE "coding_activity" DROP COLUMN "leetcode_sidebar_open";
  ALTER TABLE "coding_activity" DROP COLUMN "leetcode_about_open";`)
}
