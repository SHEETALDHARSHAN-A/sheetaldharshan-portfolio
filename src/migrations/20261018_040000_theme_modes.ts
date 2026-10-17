import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_appearance_theme" ADD VALUE 'system';
  ALTER TABLE "appearance" ADD COLUMN "theme_toggle" boolean DEFAULT true;
  ALTER TABLE "appearance" ADD COLUMN "light_background" varchar;
  ALTER TABLE "appearance" ADD COLUMN "light_surface" varchar;
  ALTER TABLE "appearance" ADD COLUMN "light_text" varchar;
  ALTER TABLE "appearance" ADD COLUMN "light_muted" varchar;
  ALTER TABLE "appearance" ADD COLUMN "light_accent" varchar;
  ALTER TABLE "appearance" ADD COLUMN "light_line" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "appearance" ALTER COLUMN "theme" SET DATA TYPE text;
  ALTER TABLE "appearance" ALTER COLUMN "theme" SET DEFAULT 'dark'::text;
  DROP TYPE "public"."enum_appearance_theme";
  CREATE TYPE "public"."enum_appearance_theme" AS ENUM('dark', 'light');
  ALTER TABLE "appearance" ALTER COLUMN "theme" SET DEFAULT 'dark'::"public"."enum_appearance_theme";
  ALTER TABLE "appearance" ALTER COLUMN "theme" SET DATA TYPE "public"."enum_appearance_theme" USING "theme"::"public"."enum_appearance_theme";
  ALTER TABLE "appearance" DROP COLUMN "theme_toggle";
  ALTER TABLE "appearance" DROP COLUMN "light_background";
  ALTER TABLE "appearance" DROP COLUMN "light_surface";
  ALTER TABLE "appearance" DROP COLUMN "light_text";
  ALTER TABLE "appearance" DROP COLUMN "light_muted";
  ALTER TABLE "appearance" DROP COLUMN "light_accent";
  ALTER TABLE "appearance" DROP COLUMN "light_line";`)
}
