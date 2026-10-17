import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_appearance_body_font" AS ENUM('preset', 'ibm-plex-sans', 'dm-sans', 'manrope', 'work-sans', 'source-sans-3');
  CREATE TYPE "public"."enum_appearance_heading_font" AS ENUM('barlow-condensed', 'oswald', 'bebas-neue', 'anton', 'archivo-narrow', 'inter-tight');
  CREATE TYPE "public"."enum_projects_page_image_transition" AS ENUM('wipe', 'fade', 'none');
  CREATE TABLE "projects_hero_loop" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "_projects_v_version_hero_loop" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  
  
  CREATE TABLE "projects_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"card_color" varchar,
  	"card_text_color" varchar,
  	"arrow_color" varchar,
  	"stage_background" varchar,
  	"image_transition" "enum_projects_page_image_transition" DEFAULT 'wipe',
  	"image_zoom" boolean DEFAULT true,
  	"zoom_seconds" numeric DEFAULT 14,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "projects" ADD COLUMN "card_color" varchar;
  ALTER TABLE "projects" ADD COLUMN "card_text_color" varchar;
  ALTER TABLE "projects" ADD COLUMN "page_background" varchar;
  ALTER TABLE "projects" ADD COLUMN "page_text_color" varchar;
  ALTER TABLE "projects" ADD COLUMN "loop_seconds" numeric DEFAULT 5;
  ALTER TABLE "_projects_v" ADD COLUMN "version_card_color" varchar;
  ALTER TABLE "_projects_v" ADD COLUMN "version_card_text_color" varchar;
  ALTER TABLE "_projects_v" ADD COLUMN "version_page_background" varchar;
  ALTER TABLE "_projects_v" ADD COLUMN "version_page_text_color" varchar;
  ALTER TABLE "_projects_v" ADD COLUMN "version_loop_seconds" numeric DEFAULT 5;
  ALTER TABLE "appearance" ADD COLUMN "color_background" varchar;
  ALTER TABLE "appearance" ADD COLUMN "color_surface" varchar;
  ALTER TABLE "appearance" ADD COLUMN "color_text" varchar;
  ALTER TABLE "appearance" ADD COLUMN "color_muted" varchar;
  ALTER TABLE "appearance" ADD COLUMN "color_accent" varchar;
  ALTER TABLE "appearance" ADD COLUMN "color_line" varchar;
  ALTER TABLE "appearance" ADD COLUMN "body_font" "enum_appearance_body_font" DEFAULT 'preset';
  ALTER TABLE "appearance" ADD COLUMN "heading_font" "enum_appearance_heading_font" DEFAULT 'barlow-condensed';
  ALTER TABLE "projects_hero_loop" ADD CONSTRAINT "projects_hero_loop_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_hero_loop" ADD CONSTRAINT "projects_hero_loop_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_hero_loop" ADD CONSTRAINT "_projects_v_version_hero_loop_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_version_hero_loop" ADD CONSTRAINT "_projects_v_version_hero_loop_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "projects_hero_loop_order_idx" ON "projects_hero_loop" USING btree ("_order");
  CREATE INDEX "projects_hero_loop_parent_id_idx" ON "projects_hero_loop" USING btree ("_parent_id");
  CREATE INDEX "projects_hero_loop_image_idx" ON "projects_hero_loop" USING btree ("image_id");
  CREATE INDEX "_projects_v_version_hero_loop_order_idx" ON "_projects_v_version_hero_loop" USING btree ("_order");
  CREATE INDEX "_projects_v_version_hero_loop_parent_id_idx" ON "_projects_v_version_hero_loop" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_hero_loop_image_idx" ON "_projects_v_version_hero_loop" USING btree ("image_id");
  -- Like every other public table: closed to Supabase's REST API; Payload connects as the owner.
  ALTER TABLE "projects_hero_loop" ENABLE ROW LEVEL SECURITY;
  ALTER TABLE "_projects_v_version_hero_loop" ENABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects_page" ENABLE ROW LEVEL SECURITY;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "projects_hero_loop" CASCADE;
  DROP TABLE "_projects_v_version_hero_loop" CASCADE;
  DROP TABLE "projects_page" CASCADE;
  ALTER TABLE "projects" DROP COLUMN "card_color";
  ALTER TABLE "projects" DROP COLUMN "card_text_color";
  ALTER TABLE "projects" DROP COLUMN "page_background";
  ALTER TABLE "projects" DROP COLUMN "page_text_color";
  ALTER TABLE "projects" DROP COLUMN "loop_seconds";
  ALTER TABLE "_projects_v" DROP COLUMN "version_card_color";
  ALTER TABLE "_projects_v" DROP COLUMN "version_card_text_color";
  ALTER TABLE "_projects_v" DROP COLUMN "version_page_background";
  ALTER TABLE "_projects_v" DROP COLUMN "version_page_text_color";
  ALTER TABLE "_projects_v" DROP COLUMN "version_loop_seconds";
  ALTER TABLE "appearance" DROP COLUMN "color_background";
  ALTER TABLE "appearance" DROP COLUMN "color_surface";
  ALTER TABLE "appearance" DROP COLUMN "color_text";
  ALTER TABLE "appearance" DROP COLUMN "color_muted";
  ALTER TABLE "appearance" DROP COLUMN "color_accent";
  ALTER TABLE "appearance" DROP COLUMN "color_line";
  ALTER TABLE "appearance" DROP COLUMN "body_font";
  ALTER TABLE "appearance" DROP COLUMN "heading_font";
  DROP TYPE "public"."enum_appearance_body_font";
  DROP TYPE "public"."enum_appearance_heading_font";
  DROP TYPE "public"."enum_projects_page_image_transition";`)
}
