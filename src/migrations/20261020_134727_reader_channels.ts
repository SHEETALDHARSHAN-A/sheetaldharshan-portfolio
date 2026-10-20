import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "reader_lists" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"emoji" varchar,
  	"reader_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "reader_lists_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer
  );
  
  ALTER TABLE "kb_settings" ALTER COLUMN "intro" SET DEFAULT 'What I''m reading, building and learning, written up as I go.';
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "reader_lists_id" integer;
  ALTER TABLE "reader_lists" ADD CONSTRAINT "reader_lists_reader_id_readers_id_fk" FOREIGN KEY ("reader_id") REFERENCES "public"."readers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reader_lists_rels" ADD CONSTRAINT "reader_lists_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."reader_lists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reader_lists_rels" ADD CONSTRAINT "reader_lists_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "reader_lists_reader_idx" ON "reader_lists" USING btree ("reader_id");
  CREATE INDEX "reader_lists_updated_at_idx" ON "reader_lists" USING btree ("updated_at");
  CREATE INDEX "reader_lists_created_at_idx" ON "reader_lists" USING btree ("created_at");
  CREATE INDEX "reader_lists_rels_order_idx" ON "reader_lists_rels" USING btree ("order");
  CREATE INDEX "reader_lists_rels_parent_idx" ON "reader_lists_rels" USING btree ("parent_id");
  CREATE INDEX "reader_lists_rels_path_idx" ON "reader_lists_rels" USING btree ("path");
  CREATE INDEX "reader_lists_rels_posts_id_idx" ON "reader_lists_rels" USING btree ("posts_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reader_lists_fk" FOREIGN KEY ("reader_lists_id") REFERENCES "public"."reader_lists"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_reader_lists_id_idx" ON "payload_locked_documents_rels" USING btree ("reader_lists_id");
  ALTER TABLE "reader_lists" ENABLE ROW LEVEL SECURITY;
  ALTER TABLE "reader_lists_rels" ENABLE ROW LEVEL SECURITY;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "reader_lists" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "reader_lists_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "reader_lists" CASCADE;
  DROP TABLE "reader_lists_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_reader_lists_fk";
  
  DROP INDEX "payload_locked_documents_rels_reader_lists_id_idx";
  ALTER TABLE "kb_settings" ALTER COLUMN "intro" SET DEFAULT 'What''s on my screen right now: notes on what I''m reading, building and learning, written up so you can read along. Pick a channel, star the ones you like, and tell me if anything could be clearer.';
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "reader_lists_id";`)
}
