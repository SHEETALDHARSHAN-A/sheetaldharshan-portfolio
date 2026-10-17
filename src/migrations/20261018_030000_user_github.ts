import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" ADD COLUMN "github_username" varchar;
  CREATE UNIQUE INDEX "users_github_username_idx" ON "users" USING btree ("github_username");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "users_github_username_idx";
  ALTER TABLE "users" DROP COLUMN "github_username";`)
}
