import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "coding_activity_github_accounts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"username" varchar NOT NULL,
  	"enabled" boolean DEFAULT true
  );
  
  CREATE TABLE "coding_activity_leetcode_accounts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"username" varchar NOT NULL,
  	"enabled" boolean DEFAULT true
  );
  
  CREATE TABLE "coding_activity" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"github_enabled" boolean DEFAULT true,
  	"leetcode_enabled" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "prefix" varchar DEFAULT 'media';
  ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "_objectkey" varchar;
  ALTER TABLE "coding_activity_github_accounts" ADD CONSTRAINT "coding_activity_github_accounts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."coding_activity"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "coding_activity_leetcode_accounts" ADD CONSTRAINT "coding_activity_leetcode_accounts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."coding_activity"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "coding_activity_github_accounts_order_idx" ON "coding_activity_github_accounts" USING btree ("_order");
  CREATE INDEX "coding_activity_github_accounts_parent_id_idx" ON "coding_activity_github_accounts" USING btree ("_parent_id");
  CREATE INDEX "coding_activity_leetcode_accounts_order_idx" ON "coding_activity_leetcode_accounts" USING btree ("_order");
  CREATE INDEX "coding_activity_leetcode_accounts_parent_id_idx" ON "coding_activity_leetcode_accounts" USING btree ("_parent_id");
  -- Like every other public table: closed to Supabase's REST API; Payload connects as the owner.
  ALTER TABLE "coding_activity" ENABLE ROW LEVEL SECURITY;
  ALTER TABLE "coding_activity_github_accounts" ENABLE ROW LEVEL SECURITY;
  ALTER TABLE "coding_activity_leetcode_accounts" ENABLE ROW LEVEL SECURITY;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "coding_activity_github_accounts" CASCADE;
  DROP TABLE "coding_activity_leetcode_accounts" CASCADE;
  DROP TABLE "coding_activity" CASCADE;
`)
}
