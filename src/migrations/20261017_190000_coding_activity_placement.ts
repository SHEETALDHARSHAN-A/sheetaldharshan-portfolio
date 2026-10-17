import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Each coding-activity card gets its own placement switches (sidebar, About page) instead of one on/off.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "coding_activity" ADD COLUMN IF NOT EXISTS "github_in_sidebar" boolean DEFAULT true;
  ALTER TABLE "coding_activity" ADD COLUMN IF NOT EXISTS "github_on_about" boolean DEFAULT true;
  ALTER TABLE "coding_activity" ADD COLUMN IF NOT EXISTS "leetcode_in_sidebar" boolean DEFAULT false;
  ALTER TABLE "coding_activity" ADD COLUMN IF NOT EXISTS "leetcode_on_about" boolean DEFAULT true;
  UPDATE "coding_activity" SET
    "github_in_sidebar" = COALESCE("github_enabled", true),
    "github_on_about" = COALESCE("github_enabled", true),
    "leetcode_in_sidebar" = false,
    "leetcode_on_about" = COALESCE("leetcode_enabled", true);
  ALTER TABLE "coding_activity" DROP COLUMN IF EXISTS "github_enabled";
  ALTER TABLE "coding_activity" DROP COLUMN IF EXISTS "leetcode_enabled";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "coding_activity" ADD COLUMN IF NOT EXISTS "github_enabled" boolean DEFAULT true;
  ALTER TABLE "coding_activity" ADD COLUMN IF NOT EXISTS "leetcode_enabled" boolean DEFAULT true;
  UPDATE "coding_activity" SET "github_enabled" = "github_in_sidebar" OR "github_on_about", "leetcode_enabled" = "leetcode_in_sidebar" OR "leetcode_on_about";
  ALTER TABLE "coding_activity" DROP COLUMN "github_in_sidebar";
  ALTER TABLE "coding_activity" DROP COLUMN "github_on_about";
  ALTER TABLE "coding_activity" DROP COLUMN "leetcode_in_sidebar";
  ALTER TABLE "coding_activity" DROP COLUMN "leetcode_on_about";`)
}
