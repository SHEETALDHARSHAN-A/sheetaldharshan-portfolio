import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "kb_settings" ALTER COLUMN "heading" SET DEFAULT './stdout';
  ALTER TABLE "kb_settings" ALTER COLUMN "intro" SET DEFAULT 'What''s on my screen right now: notes on what I''m reading, building and learning, written up so you can read along. Pick a channel, star the ones you like, and tell me if anything could be clearer.';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "kb_settings" ALTER COLUMN "heading" SET DEFAULT 'Field Notes';
  ALTER TABLE "kb_settings" ALTER COLUMN "intro" SET DEFAULT 'Notes on what I build and learn: backend systems, AI agents, developer tools and databases. Pick a channel, star the ones you like, and tell me if something could be clearer.';`)
}
