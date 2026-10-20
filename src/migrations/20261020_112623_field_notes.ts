import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_kb_comments_status" AS ENUM('published', 'pending', 'hidden');
  CREATE TYPE "public"."enum_kb_reviews_status" AS ENUM('published', 'pending', 'hidden');
  CREATE TYPE "public"."enum_kb_feedback_kind" AS ENUM('wrong', 'simpler', 'other');
  CREATE TYPE "public"."enum_kb_votes_kind" AS ENUM('like', 'star');
  CREATE TYPE "public"."enum_kb_settings_moderation" AS ENUM('auto', 'all');
  CREATE TABLE "kb_comments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar,
  	"body" varchar NOT NULL,
  	"status" "enum_kb_comments_status" DEFAULT 'published',
  	"reason" varchar,
  	"post_id" integer NOT NULL,
  	"parent_id" integer,
  	"likes" numeric DEFAULT 0,
  	"visitor" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "kb_reviews" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"rating" numeric NOT NULL,
  	"review" varchar,
  	"name" varchar,
  	"status" "enum_kb_reviews_status" DEFAULT 'published',
  	"reason" varchar,
  	"post_id" integer NOT NULL,
  	"visitor" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "kb_feedback" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum_kb_feedback_kind" NOT NULL,
  	"quote" varchar,
  	"note" varchar,
  	"email" varchar,
  	"handled" boolean DEFAULT false,
  	"post_id" integer NOT NULL,
  	"alert" varchar,
  	"visitor" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "kb_votes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum_kb_votes_kind" NOT NULL,
  	"target" varchar NOT NULL,
  	"visitor" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "kb_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Field Notes',
  	"intro" varchar DEFAULT 'Notes on what I build and learn: backend systems, AI agents, developer tools and databases. Pick a channel, star the ones you like, and tell me if something could be clearer.',
  	"comments" boolean DEFAULT true,
  	"reviews" boolean DEFAULT true,
  	"feedback" boolean DEFAULT true,
  	"notify" boolean DEFAULT true,
  	"moderation" "enum_kb_settings_moderation" DEFAULT 'auto',
  	"blocked_words" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "categories" ADD COLUMN "emoji" varchar;
  ALTER TABLE "categories" ADD COLUMN "order" numeric DEFAULT 0;
  ALTER TABLE "categories" ADD COLUMN "description" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "kb_comments_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "kb_reviews_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "kb_feedback_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "kb_votes_id" integer;
  ALTER TABLE "kb_comments" ADD CONSTRAINT "kb_comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "kb_comments" ADD CONSTRAINT "kb_comments_parent_id_kb_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."kb_comments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "kb_reviews" ADD CONSTRAINT "kb_reviews_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "kb_feedback" ADD CONSTRAINT "kb_feedback_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "kb_comments_post_idx" ON "kb_comments" USING btree ("post_id");
  CREATE INDEX "kb_comments_parent_idx" ON "kb_comments" USING btree ("parent_id");
  CREATE INDEX "kb_comments_updated_at_idx" ON "kb_comments" USING btree ("updated_at");
  CREATE INDEX "kb_comments_created_at_idx" ON "kb_comments" USING btree ("created_at");
  CREATE INDEX "kb_reviews_post_idx" ON "kb_reviews" USING btree ("post_id");
  CREATE INDEX "kb_reviews_updated_at_idx" ON "kb_reviews" USING btree ("updated_at");
  CREATE INDEX "kb_reviews_created_at_idx" ON "kb_reviews" USING btree ("created_at");
  CREATE INDEX "kb_feedback_post_idx" ON "kb_feedback" USING btree ("post_id");
  CREATE INDEX "kb_feedback_updated_at_idx" ON "kb_feedback" USING btree ("updated_at");
  CREATE INDEX "kb_feedback_created_at_idx" ON "kb_feedback" USING btree ("created_at");
  CREATE INDEX "kb_votes_kind_idx" ON "kb_votes" USING btree ("kind");
  CREATE INDEX "kb_votes_target_idx" ON "kb_votes" USING btree ("target");
  CREATE INDEX "kb_votes_visitor_idx" ON "kb_votes" USING btree ("visitor");
  CREATE INDEX "kb_votes_updated_at_idx" ON "kb_votes" USING btree ("updated_at");
  CREATE INDEX "kb_votes_created_at_idx" ON "kb_votes" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_kb_comments_fk" FOREIGN KEY ("kb_comments_id") REFERENCES "public"."kb_comments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_kb_reviews_fk" FOREIGN KEY ("kb_reviews_id") REFERENCES "public"."kb_reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_kb_feedback_fk" FOREIGN KEY ("kb_feedback_id") REFERENCES "public"."kb_feedback"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_kb_votes_fk" FOREIGN KEY ("kb_votes_id") REFERENCES "public"."kb_votes"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_kb_comments_id_idx" ON "payload_locked_documents_rels" USING btree ("kb_comments_id");
  CREATE INDEX "payload_locked_documents_rels_kb_reviews_id_idx" ON "payload_locked_documents_rels" USING btree ("kb_reviews_id");
  CREATE INDEX "payload_locked_documents_rels_kb_feedback_id_idx" ON "payload_locked_documents_rels" USING btree ("kb_feedback_id");
  CREATE INDEX "payload_locked_documents_rels_kb_votes_id_idx" ON "payload_locked_documents_rels" USING btree ("kb_votes_id");
  ALTER TABLE "kb_comments" ENABLE ROW LEVEL SECURITY;
  ALTER TABLE "kb_reviews" ENABLE ROW LEVEL SECURITY;
  ALTER TABLE "kb_feedback" ENABLE ROW LEVEL SECURITY;
  ALTER TABLE "kb_votes" ENABLE ROW LEVEL SECURITY;
  ALTER TABLE "kb_settings" ENABLE ROW LEVEL SECURITY;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "kb_comments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "kb_reviews" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "kb_feedback" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "kb_votes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "kb_settings" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "kb_comments" CASCADE;
  DROP TABLE "kb_reviews" CASCADE;
  DROP TABLE "kb_feedback" CASCADE;
  DROP TABLE "kb_votes" CASCADE;
  DROP TABLE "kb_settings" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_kb_comments_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_kb_reviews_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_kb_feedback_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_kb_votes_fk";
  
  DROP INDEX "payload_locked_documents_rels_kb_comments_id_idx";
  DROP INDEX "payload_locked_documents_rels_kb_reviews_id_idx";
  DROP INDEX "payload_locked_documents_rels_kb_feedback_id_idx";
  DROP INDEX "payload_locked_documents_rels_kb_votes_id_idx";
  ALTER TABLE "categories" DROP COLUMN "emoji";
  ALTER TABLE "categories" DROP COLUMN "order";
  ALTER TABLE "categories" DROP COLUMN "description";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "kb_comments_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "kb_reviews_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "kb_feedback_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "kb_votes_id";
  DROP TYPE "public"."enum_kb_comments_status";
  DROP TYPE "public"."enum_kb_reviews_status";
  DROP TYPE "public"."enum_kb_feedback_kind";
  DROP TYPE "public"."enum_kb_votes_kind";
  DROP TYPE "public"."enum_kb_settings_moderation";`)
}
