import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "about" ADD COLUMN "photo_focal_x" numeric;
  ALTER TABLE "about" ADD COLUMN "photo_focal_y" numeric;
  ALTER TABLE "_about_v" ADD COLUMN "version_photo_focal_x" numeric;
  ALTER TABLE "_about_v" ADD COLUMN "version_photo_focal_y" numeric;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "about" DROP COLUMN "photo_focal_x";
  ALTER TABLE "about" DROP COLUMN "photo_focal_y";
  ALTER TABLE "_about_v" DROP COLUMN "version_photo_focal_x";
  ALTER TABLE "_about_v" DROP COLUMN "version_photo_focal_y";`)
}
