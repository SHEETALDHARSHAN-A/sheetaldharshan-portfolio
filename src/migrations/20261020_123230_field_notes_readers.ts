import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_kb_reports_reason" AS ENUM('spam', 'abuse', 'hate', 'misleading', 'off-topic', 'other');
  CREATE TYPE "public"."enum_kb_reports_status" AS ENUM('open', 'actioned', 'dismissed');
  CREATE TYPE "public"."enum_readers_status" AS ENUM('active', 'blocked');
  CREATE TYPE "public"."enum_readers_provider" AS ENUM('github', 'google', 'email');
  CREATE TABLE "kb_reports" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reason" "enum_kb_reports_reason" NOT NULL,
  	"note" varchar,
  	"quote" varchar,
  	"status" "enum_kb_reports_status" DEFAULT 'open',
  	"comment_id" integer,
  	"post_id" integer,
  	"reader_id" integer,
  	"reporter_key" varchar,
  	"alert" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "readers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar,
  	"status" "enum_readers_status" DEFAULT 'active',
  	"session_version" numeric DEFAULT 1,
  	"last_seen_at" timestamp(3) with time zone,
  	"provider" "enum_readers_provider",
  	"github_login" varchar,
  	"provider_id" varchar,
  	"avatar" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "reader_links" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"token_hash" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"name" varchar,
  	"next" varchar,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"used_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  DROP INDEX "kb_votes_visitor_idx";
  ALTER TABLE "kb_comments" ADD COLUMN "edited_at" timestamp(3) with time zone;
  ALTER TABLE "kb_comments" ADD COLUMN "deleted" boolean DEFAULT false;
  ALTER TABLE "kb_comments" ADD COLUMN "reader_id" integer;
  ALTER TABLE "kb_reviews" ADD COLUMN "edited_at" timestamp(3) with time zone;
  ALTER TABLE "kb_reviews" ADD COLUMN "reader_id" integer;
  ALTER TABLE "kb_feedback" ADD COLUMN "reader_id" integer;
  ALTER TABLE "kb_votes" ADD COLUMN "reader_id" integer NOT NULL;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "kb_reports_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "readers_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "reader_links_id" integer;
  ALTER TABLE "kb_reports" ADD CONSTRAINT "kb_reports_comment_id_kb_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."kb_comments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "kb_reports" ADD CONSTRAINT "kb_reports_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "kb_reports" ADD CONSTRAINT "kb_reports_reader_id_readers_id_fk" FOREIGN KEY ("reader_id") REFERENCES "public"."readers"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "kb_reports_comment_idx" ON "kb_reports" USING btree ("comment_id");
  CREATE INDEX "kb_reports_post_idx" ON "kb_reports" USING btree ("post_id");
  CREATE INDEX "kb_reports_reader_idx" ON "kb_reports" USING btree ("reader_id");
  CREATE INDEX "kb_reports_updated_at_idx" ON "kb_reports" USING btree ("updated_at");
  CREATE INDEX "kb_reports_created_at_idx" ON "kb_reports" USING btree ("created_at");
  CREATE INDEX "readers_email_idx" ON "readers" USING btree ("email");
  CREATE INDEX "readers_provider_id_idx" ON "readers" USING btree ("provider_id");
  CREATE INDEX "readers_updated_at_idx" ON "readers" USING btree ("updated_at");
  CREATE INDEX "readers_created_at_idx" ON "readers" USING btree ("created_at");
  CREATE INDEX "reader_links_token_hash_idx" ON "reader_links" USING btree ("token_hash");
  CREATE INDEX "reader_links_updated_at_idx" ON "reader_links" USING btree ("updated_at");
  CREATE INDEX "reader_links_created_at_idx" ON "reader_links" USING btree ("created_at");
  ALTER TABLE "kb_comments" ADD CONSTRAINT "kb_comments_reader_id_readers_id_fk" FOREIGN KEY ("reader_id") REFERENCES "public"."readers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "kb_reviews" ADD CONSTRAINT "kb_reviews_reader_id_readers_id_fk" FOREIGN KEY ("reader_id") REFERENCES "public"."readers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "kb_feedback" ADD CONSTRAINT "kb_feedback_reader_id_readers_id_fk" FOREIGN KEY ("reader_id") REFERENCES "public"."readers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "kb_votes" ADD CONSTRAINT "kb_votes_reader_id_readers_id_fk" FOREIGN KEY ("reader_id") REFERENCES "public"."readers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_kb_reports_fk" FOREIGN KEY ("kb_reports_id") REFERENCES "public"."kb_reports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_readers_fk" FOREIGN KEY ("readers_id") REFERENCES "public"."readers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reader_links_fk" FOREIGN KEY ("reader_links_id") REFERENCES "public"."reader_links"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "kb_comments_reader_idx" ON "kb_comments" USING btree ("reader_id");
  CREATE INDEX "kb_reviews_reader_idx" ON "kb_reviews" USING btree ("reader_id");
  CREATE INDEX "kb_feedback_reader_idx" ON "kb_feedback" USING btree ("reader_id");
  CREATE INDEX "kb_votes_reader_idx" ON "kb_votes" USING btree ("reader_id");
  CREATE INDEX "payload_locked_documents_rels_kb_reports_id_idx" ON "payload_locked_documents_rels" USING btree ("kb_reports_id");
  CREATE INDEX "payload_locked_documents_rels_readers_id_idx" ON "payload_locked_documents_rels" USING btree ("readers_id");
  CREATE INDEX "payload_locked_documents_rels_reader_links_id_idx" ON "payload_locked_documents_rels" USING btree ("reader_links_id");
  ALTER TABLE "kb_comments" DROP COLUMN "email";
  ALTER TABLE "kb_comments" DROP COLUMN "visitor";
  ALTER TABLE "kb_reviews" DROP COLUMN "visitor";
  ALTER TABLE "kb_feedback" DROP COLUMN "visitor";
  ALTER TABLE "kb_votes" DROP COLUMN "visitor";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "kb_reports" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "readers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "reader_links" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "kb_reports" CASCADE;
  DROP TABLE "readers" CASCADE;
  DROP TABLE "reader_links" CASCADE;
  ALTER TABLE "kb_comments" DROP COLUMN "deleted";
  ALTER TABLE "kb_comments" ADD COLUMN "email" varchar;
  ALTER TABLE "kb_comments" DROP CONSTRAINT "kb_comments_reader_id_readers_id_fk";
  
  ALTER TABLE "kb_reviews" DROP CONSTRAINT "kb_reviews_reader_id_readers_id_fk";
  
  ALTER TABLE "kb_feedback" DROP CONSTRAINT "kb_feedback_reader_id_readers_id_fk";
  
  ALTER TABLE "kb_votes" DROP CONSTRAINT "kb_votes_reader_id_readers_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_kb_reports_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_readers_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_reader_links_fk";
  
  DROP INDEX "kb_comments_reader_idx";
  DROP INDEX "kb_reviews_reader_idx";
  DROP INDEX "kb_feedback_reader_idx";
  DROP INDEX "kb_votes_reader_idx";
  DROP INDEX "payload_locked_documents_rels_kb_reports_id_idx";
  DROP INDEX "payload_locked_documents_rels_readers_id_idx";
  DROP INDEX "payload_locked_documents_rels_reader_links_id_idx";
  ALTER TABLE "kb_comments" ADD COLUMN "visitor" varchar;
  ALTER TABLE "kb_reviews" ADD COLUMN "visitor" varchar;
  ALTER TABLE "kb_feedback" ADD COLUMN "visitor" varchar;
  ALTER TABLE "kb_votes" ADD COLUMN "visitor" varchar NOT NULL;
  CREATE INDEX "kb_votes_visitor_idx" ON "kb_votes" USING btree ("visitor");
  ALTER TABLE "kb_comments" DROP COLUMN "edited_at";
  ALTER TABLE "kb_comments" DROP COLUMN "reader_id";
  ALTER TABLE "kb_reviews" DROP COLUMN "edited_at";
  ALTER TABLE "kb_reviews" DROP COLUMN "reader_id";
  ALTER TABLE "kb_feedback" DROP COLUMN "reader_id";
  ALTER TABLE "kb_votes" DROP COLUMN "reader_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "kb_reports_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "readers_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "reader_links_id";
  DROP TYPE "public"."enum_kb_reports_reason";
  DROP TYPE "public"."enum_kb_reports_status";
  DROP TYPE "public"."enum_readers_status";
  DROP TYPE "public"."enum_readers_provider";`)
}
