import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_admin_look_font" AS ENUM('system', 'ibm-plex-sans', 'dm-sans', 'manrope', 'work-sans', 'source-sans-3');
  CREATE TYPE "public"."enum_admin_look_radius" AS ENUM('default', 'round', 'square');
  CREATE TABLE "admin_look" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"logo_id" integer,
  	"logo_text" varchar DEFAULT 'sheetaldharshan.me',
  	"icon_id" integer,
  	"avatar_id" integer,
  	"accent_color" varchar,
  	"background_dark" varchar,
  	"background_light" varchar,
  	"font" "enum_admin_look_font" DEFAULT 'system',
  	"radius" "enum_admin_look_radius" DEFAULT 'default',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users" ADD COLUMN "photo_id" integer;
  ALTER TABLE "admin_look" ADD CONSTRAINT "admin_look_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "admin_look" ADD CONSTRAINT "admin_look_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "admin_look" ADD CONSTRAINT "admin_look_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "admin_look_logo_idx" ON "admin_look" USING btree ("logo_id");
  CREATE INDEX "admin_look_icon_idx" ON "admin_look" USING btree ("icon_id");
  CREATE INDEX "admin_look_avatar_idx" ON "admin_look" USING btree ("avatar_id");
  ALTER TABLE "users" ADD CONSTRAINT "users_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "users_photo_idx" ON "users" USING btree ("photo_id");
  -- Like every other public table: closed to Supabase's REST API; Payload connects as the owner.
  ALTER TABLE "admin_look" ENABLE ROW LEVEL SECURITY;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "admin_look" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "admin_look" CASCADE;
  ALTER TABLE "users" DROP CONSTRAINT "users_photo_id_media_id_fk";
  
  DROP INDEX "users_photo_idx";
  ALTER TABLE "users" DROP COLUMN "photo_id";
  DROP TYPE "public"."enum_admin_look_font";
  DROP TYPE "public"."enum_admin_look_radius";`)
}
