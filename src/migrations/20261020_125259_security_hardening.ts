import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "kb_comments" ADD COLUMN "ip_hash" varchar;
  ALTER TABLE "kb_feedback" ADD COLUMN "ip_hash" varchar;
  ALTER TABLE "reader_links" ADD COLUMN "ip_hash" varchar;
  ALTER TABLE "messages" ADD COLUMN "ip_hash" varchar;
  CREATE INDEX "kb_comments_ip_hash_idx" ON "kb_comments" USING btree ("ip_hash");
  CREATE INDEX "kb_feedback_ip_hash_idx" ON "kb_feedback" USING btree ("ip_hash");
  CREATE INDEX "reader_links_ip_hash_idx" ON "reader_links" USING btree ("ip_hash");
  CREATE INDEX "messages_ip_hash_idx" ON "messages" USING btree ("ip_hash");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "kb_comments_ip_hash_idx";
  DROP INDEX "kb_feedback_ip_hash_idx";
  DROP INDEX "reader_links_ip_hash_idx";
  DROP INDEX "messages_ip_hash_idx";
  ALTER TABLE "kb_comments" DROP COLUMN "ip_hash";
  ALTER TABLE "kb_feedback" DROP COLUMN "ip_hash";
  ALTER TABLE "reader_links" DROP COLUMN "ip_hash";
  ALTER TABLE "messages" DROP COLUMN "ip_hash";`)
}
