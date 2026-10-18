import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_contact_page_fields_type" AS ENUM('name', 'email', 'phone', 'text', 'textarea', 'choice');
  CREATE TYPE "public"."enum_contact_page_mode" AS ENUM('both', 'chat', 'form');
  CREATE TYPE "public"."enum_contact_page_first_mode" AS ENUM('chat', 'form');
  CREATE TABLE "messages_answers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "contact_page_fields_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar
  );
  
  CREATE TABLE "contact_page_fields" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"type" "enum_contact_page_fields_type" DEFAULT 'text' NOT NULL,
  	"key" varchar NOT NULL,
  	"question" varchar NOT NULL,
  	"required" boolean DEFAULT true,
  	"placeholder" varchar,
  	"retry" varchar,
  	"reply" varchar
  );
  
  CREATE TABLE "contact_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Say hello',
  	"intro" varchar DEFAULT 'Got a project in mind, a role to talk about, or a question about something I built? Send me a message here, or use whichever channel suits you.',
  	"mode" "enum_contact_page_mode" DEFAULT 'both',
  	"first_mode" "enum_contact_page_first_mode" DEFAULT 'chat',
  	"greeting" varchar DEFAULT 'Hi there 👋',
  	"done_message" varchar DEFAULT 'Done! Thanks, {first} 🙌 I''ll reply to {email} soon.',
  	"form_note" varchar DEFAULT 'Your details are only used to reply to you.',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "messages" ALTER COLUMN "topic" SET DATA TYPE varchar;
  ALTER TABLE "messages" ALTER COLUMN "topic" DROP DEFAULT;
  ALTER TABLE "messages_answers" ADD CONSTRAINT "messages_answers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_page_fields_options" ADD CONSTRAINT "contact_page_fields_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_page_fields"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_page_fields" ADD CONSTRAINT "contact_page_fields_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_page"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "messages_answers_order_idx" ON "messages_answers" USING btree ("_order");
  CREATE INDEX "messages_answers_parent_id_idx" ON "messages_answers" USING btree ("_parent_id");
  CREATE INDEX "contact_page_fields_options_order_idx" ON "contact_page_fields_options" USING btree ("_order");
  CREATE INDEX "contact_page_fields_options_parent_id_idx" ON "contact_page_fields_options" USING btree ("_parent_id");
  CREATE INDEX "contact_page_fields_order_idx" ON "contact_page_fields" USING btree ("_order");
  CREATE INDEX "contact_page_fields_parent_id_idx" ON "contact_page_fields" USING btree ("_parent_id");
  DROP TYPE "public"."enum_messages_topic";
  -- Like every other public table: closed to Supabase's REST API; Payload connects as the owner.
  ALTER TABLE "messages_answers" ENABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_page_fields_options" ENABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_page_fields" ENABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_page" ENABLE ROW LEVEL SECURITY;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "messages_answers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_page_fields_options" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_page_fields" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_page" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "messages_answers" CASCADE;
  DROP TABLE "contact_page_fields_options" CASCADE;
  DROP TABLE "contact_page_fields" CASCADE;
  DROP TABLE "contact_page" CASCADE;
  ALTER TABLE "messages" ALTER COLUMN "topic" SET DATA TYPE text;
  ALTER TABLE "messages" ALTER COLUMN "topic" SET DEFAULT 'hello'::text;
  CREATE TYPE "public"."enum_messages_topic" AS ENUM('role', 'project', 'exasol', 'hello');
  ALTER TABLE "messages" ALTER COLUMN "topic" SET DEFAULT 'hello'::"public"."enum_messages_topic";
  ALTER TABLE "messages" ALTER COLUMN "topic" SET DATA TYPE "public"."enum_messages_topic" USING "topic"::"public"."enum_messages_topic";
  DROP TYPE "public"."enum_contact_page_fields_type";
  DROP TYPE "public"."enum_contact_page_first_mode";
  DROP TYPE "public"."enum_contact_page_mode";`)
}
