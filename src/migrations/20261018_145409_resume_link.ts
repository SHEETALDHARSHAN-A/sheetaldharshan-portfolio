import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "contact_page" ALTER COLUMN "done_message" SET DEFAULT 'Thanks, {name} 🙌 I''ll reply to {email} soon.';
  ALTER TABLE "site_settings" ADD COLUMN "resume_link" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "contact_page" ALTER COLUMN "done_message" SET DEFAULT 'Done! Thanks, {first} 🙌 I''ll reply to {email} soon.';
  ALTER TABLE "site_settings" DROP COLUMN "resume_link";`)
}
