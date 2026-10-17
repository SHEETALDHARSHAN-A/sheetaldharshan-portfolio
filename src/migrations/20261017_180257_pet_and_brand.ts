import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pet" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"show_on_phones" boolean DEFAULT true,
  	"sprite_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "brand" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"favicon_light_id" integer,
  	"favicon_dark_id" integer,
  	"apple_icon_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "pet" ADD CONSTRAINT "pet_sprite_id_media_id_fk" FOREIGN KEY ("sprite_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brand" ADD CONSTRAINT "brand_favicon_light_id_media_id_fk" FOREIGN KEY ("favicon_light_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brand" ADD CONSTRAINT "brand_favicon_dark_id_media_id_fk" FOREIGN KEY ("favicon_dark_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brand" ADD CONSTRAINT "brand_apple_icon_id_media_id_fk" FOREIGN KEY ("apple_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pet_sprite_idx" ON "pet" USING btree ("sprite_id");
  CREATE INDEX "brand_favicon_light_idx" ON "brand" USING btree ("favicon_light_id");
  CREATE INDEX "brand_favicon_dark_idx" ON "brand" USING btree ("favicon_dark_id");
  CREATE INDEX "brand_apple_icon_idx" ON "brand" USING btree ("apple_icon_id");
  -- Like every other public table: closed to Supabase's REST API; Payload connects as the owner.
  ALTER TABLE "pet" ENABLE ROW LEVEL SECURITY;
  ALTER TABLE "brand" ENABLE ROW LEVEL SECURITY;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pet" CASCADE;
  DROP TABLE "brand" CASCADE;`)
}
