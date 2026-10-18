import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "messages" ADD COLUMN "alert" varchar;
  ALTER TABLE "contact_page" ADD COLUMN "notify" boolean DEFAULT true;
  ALTER TABLE "contact_page" ADD COLUMN "notify_email" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "messages" DROP COLUMN "alert";
  ALTER TABLE "contact_page" DROP COLUMN "notify";
  ALTER TABLE "contact_page" DROP COLUMN "notify_email";`)
}
