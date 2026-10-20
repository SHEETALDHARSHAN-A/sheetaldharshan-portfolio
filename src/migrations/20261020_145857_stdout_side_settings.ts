import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_kb_settings_side_open_sections" AS ENUM('browse', 'mine', 'channels', 'you');
  CREATE TABLE "kb_settings_side_open_sections" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_kb_settings_side_open_sections",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  ALTER TABLE "kb_settings" ADD COLUMN "side_search_placeholder" varchar;
  ALTER TABLE "kb_settings" ADD COLUMN "side_privacy" varchar;
  ALTER TABLE "kb_settings" ADD COLUMN "side_browse" varchar;
  ALTER TABLE "kb_settings" ADD COLUMN "side_all_posts" varchar;
  ALTER TABLE "kb_settings" ADD COLUMN "side_channels" varchar;
  ALTER TABLE "kb_settings" ADD COLUMN "side_your_channels" varchar;
  ALTER TABLE "kb_settings" ADD COLUMN "side_new_channel" varchar;
  ALTER TABLE "kb_settings" ADD COLUMN "side_new_channel_placeholder" varchar;
  ALTER TABLE "kb_settings" ADD COLUMN "side_mine_hint" varchar;
  ALTER TABLE "kb_settings" ADD COLUMN "side_you" varchar;
  ALTER TABLE "kb_settings" ADD COLUMN "side_sign_in" varchar;
  ALTER TABLE "kb_settings" ADD COLUMN "side_sign_in_rest" varchar;
  ALTER TABLE "kb_settings" ADD COLUMN "side_open_current" boolean DEFAULT true;
  ALTER TABLE "kb_settings" ADD COLUMN "side_show_counts" boolean DEFAULT true;
  ALTER TABLE "kb_settings" ADD COLUMN "side_items_per_channel" numeric DEFAULT 50;
  ALTER TABLE "kb_settings" ADD COLUMN "empty_index_command" varchar;
  ALTER TABLE "kb_settings" ADD COLUMN "empty_index_line" varchar;
  ALTER TABLE "kb_settings" ADD COLUMN "empty_search_line" varchar;
  ALTER TABLE "kb_settings" ADD COLUMN "empty_channel_line" varchar;
  ALTER TABLE "kb_settings" ADD COLUMN "empty_index_eyebrow" varchar;
  ALTER TABLE "kb_settings" ADD COLUMN "empty_channel_eyebrow" varchar;
  ALTER TABLE "kb_settings_side_open_sections" ADD CONSTRAINT "kb_settings_side_open_sections_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."kb_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "kb_settings_side_open_sections_order_idx" ON "kb_settings_side_open_sections" USING btree ("order");
  CREATE INDEX "kb_settings_side_open_sections_parent_idx" ON "kb_settings_side_open_sections" USING btree ("parent_id");
  ALTER TABLE "kb_settings_side_open_sections" ENABLE ROW LEVEL SECURITY;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "kb_settings_side_open_sections" CASCADE;
  ALTER TABLE "kb_settings" DROP COLUMN "side_search_placeholder";
  ALTER TABLE "kb_settings" DROP COLUMN "side_privacy";
  ALTER TABLE "kb_settings" DROP COLUMN "side_browse";
  ALTER TABLE "kb_settings" DROP COLUMN "side_all_posts";
  ALTER TABLE "kb_settings" DROP COLUMN "side_channels";
  ALTER TABLE "kb_settings" DROP COLUMN "side_your_channels";
  ALTER TABLE "kb_settings" DROP COLUMN "side_new_channel";
  ALTER TABLE "kb_settings" DROP COLUMN "side_new_channel_placeholder";
  ALTER TABLE "kb_settings" DROP COLUMN "side_mine_hint";
  ALTER TABLE "kb_settings" DROP COLUMN "side_you";
  ALTER TABLE "kb_settings" DROP COLUMN "side_sign_in";
  ALTER TABLE "kb_settings" DROP COLUMN "side_sign_in_rest";
  ALTER TABLE "kb_settings" DROP COLUMN "side_open_current";
  ALTER TABLE "kb_settings" DROP COLUMN "side_show_counts";
  ALTER TABLE "kb_settings" DROP COLUMN "side_items_per_channel";
  ALTER TABLE "kb_settings" DROP COLUMN "empty_index_command";
  ALTER TABLE "kb_settings" DROP COLUMN "empty_index_line";
  ALTER TABLE "kb_settings" DROP COLUMN "empty_search_line";
  ALTER TABLE "kb_settings" DROP COLUMN "empty_channel_line";
  ALTER TABLE "kb_settings" DROP COLUMN "empty_index_eyebrow";
  ALTER TABLE "kb_settings" DROP COLUMN "empty_channel_eyebrow";
  DROP TYPE "public"."enum_kb_settings_side_open_sections";`)
}
