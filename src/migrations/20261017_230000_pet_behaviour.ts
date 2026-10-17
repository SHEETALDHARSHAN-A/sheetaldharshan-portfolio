import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pet_idle_action" AS ENUM('none', 'wave', 'jump', 'think', 'work', 'wait', 'sad', 'look', 'stroll');
  CREATE TYPE "public"."enum_pet_return_action" AS ENUM('none', 'wave', 'jump', 'think', 'work', 'wait', 'sad', 'look');
  CREATE TYPE "public"."enum_pet_click_action" AS ENUM('none', 'wave', 'jump', 'think', 'work', 'wait', 'sad', 'look');
  CREATE TYPE "public"."enum_pet_drop_action" AS ENUM('none', 'wave', 'jump', 'think', 'work', 'wait', 'sad', 'look');
  CREATE TYPE "public"."enum_pet_found_action" AS ENUM('none', 'wave', 'jump', 'think', 'work', 'wait', 'sad', 'look');
  CREATE TYPE "public"."enum_pet_empty_action" AS ENUM('none', 'wave', 'jump', 'think', 'work', 'wait', 'sad', 'look');
  ALTER TABLE "coding_activity" ALTER COLUMN "github_sidebar_open" SET DEFAULT true;
  ALTER TABLE "pet" ADD COLUMN "idle_after" numeric DEFAULT 30;
  ALTER TABLE "pet" ADD COLUMN "idle_action" "enum_pet_idle_action" DEFAULT 'wait';
  ALTER TABLE "pet" ADD COLUMN "idle_repeat" boolean DEFAULT true;
  ALTER TABLE "pet" ADD COLUMN "return_action" "enum_pet_return_action" DEFAULT 'wave';
  ALTER TABLE "pet" ADD COLUMN "click_action" "enum_pet_click_action" DEFAULT 'wave';
  ALTER TABLE "pet" ADD COLUMN "drop_action" "enum_pet_drop_action" DEFAULT 'none';
  ALTER TABLE "pet" ADD COLUMN "found_action" "enum_pet_found_action" DEFAULT 'none';
  ALTER TABLE "pet" ADD COLUMN "empty_action" "enum_pet_empty_action" DEFAULT 'none';
  ALTER TABLE "pet" ADD COLUMN "follow_cursor" boolean DEFAULT true;
  ALTER TABLE "pet" ADD COLUMN "stroll" boolean DEFAULT true;
  ALTER TABLE "pet" ADD COLUMN "stroll_every" numeric DEFAULT 40;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "coding_activity" ALTER COLUMN "github_sidebar_open" SET DEFAULT false;
  ALTER TABLE "pet" DROP COLUMN "idle_after";
  ALTER TABLE "pet" DROP COLUMN "idle_action";
  ALTER TABLE "pet" DROP COLUMN "idle_repeat";
  ALTER TABLE "pet" DROP COLUMN "return_action";
  ALTER TABLE "pet" DROP COLUMN "click_action";
  ALTER TABLE "pet" DROP COLUMN "drop_action";
  ALTER TABLE "pet" DROP COLUMN "found_action";
  ALTER TABLE "pet" DROP COLUMN "empty_action";
  ALTER TABLE "pet" DROP COLUMN "follow_cursor";
  ALTER TABLE "pet" DROP COLUMN "stroll";
  ALTER TABLE "pet" DROP COLUMN "stroll_every";
  DROP TYPE "public"."enum_pet_idle_action";
  DROP TYPE "public"."enum_pet_return_action";
  DROP TYPE "public"."enum_pet_click_action";
  DROP TYPE "public"."enum_pet_drop_action";
  DROP TYPE "public"."enum_pet_found_action";
  DROP TYPE "public"."enum_pet_empty_action";`)
}
