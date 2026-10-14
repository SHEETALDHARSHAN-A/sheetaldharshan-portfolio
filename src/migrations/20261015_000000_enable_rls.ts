import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * Supabase exposes the public schema through its REST API. Payload connects as the table owner,
 * which bypasses row-level security, so enabling RLS with no policies blocks the public API
 * without affecting the app. Re-run safe; also covers tables created by later migrations if
 * this is applied again.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    DECLARE t record;
    BEGIN
      FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND NOT rowsecurity LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
      END LOOP;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    DECLARE t record;
    BEGIN
      FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND rowsecurity LOOP
        EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', t.tablename);
      END LOOP;
    END $$;
  `)
}
