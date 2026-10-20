import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "contact_page" ALTER COLUMN "email_accent" SET DEFAULT '';
  ALTER TABLE "reader_links" ADD COLUMN "poll_hash" varchar;
  ALTER TABLE "reader_links" ADD COLUMN "confirmed_at" timestamp(3) with time zone;
  ALTER TABLE "reader_links" ADD COLUMN "claimed_at" timestamp(3) with time zone;
  ALTER TABLE "reader_links" ADD COLUMN "reader_id" integer;
  ALTER TABLE "reader_links" ADD CONSTRAINT "reader_links_reader_id_readers_id_fk" FOREIGN KEY ("reader_id") REFERENCES "public"."readers"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "reader_links_poll_hash_idx" ON "reader_links" USING btree ("poll_hash");
  CREATE INDEX "reader_links_reader_idx" ON "reader_links" USING btree ("reader_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "reader_links" DROP CONSTRAINT "reader_links_reader_id_readers_id_fk";
  
  DROP INDEX "reader_links_poll_hash_idx";
  DROP INDEX "reader_links_reader_idx";
  ALTER TABLE "contact_page" ALTER COLUMN "email_accent" SET DEFAULT '#ff3400';
  ALTER TABLE "reader_links" DROP COLUMN "poll_hash";
  ALTER TABLE "reader_links" DROP COLUMN "confirmed_at";
  ALTER TABLE "reader_links" DROP COLUMN "claimed_at";
  ALTER TABLE "reader_links" DROP COLUMN "reader_id";`)
}
