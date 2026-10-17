import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "navigation" ADD COLUMN "sidebar_background" varchar;
  ALTER TABLE "navigation" ADD COLUMN "wordmark_color" varchar;
  ALTER TABLE "navigation" ADD COLUMN "wordmark_dot_color" varchar;
  ALTER TABLE "navigation" ADD COLUMN "menu_color" varchar;
  ALTER TABLE "navigation" ADD COLUMN "menu_active_color" varchar;
  ALTER TABLE "navigation" ADD COLUMN "menu_font_size" numeric;
  ALTER TABLE "navigation" ADD COLUMN "wordmark_font_size" numeric;
  ALTER TABLE "homepage" ADD COLUMN "page_background" varchar;
  ALTER TABLE "homepage" ADD COLUMN "bubble_color" varchar;
  ALTER TABLE "homepage" ADD COLUMN "text_color" varchar;
  ALTER TABLE "homepage" ADD COLUMN "link_color" varchar;
  ALTER TABLE "_homepage_v" ADD COLUMN "version_page_background" varchar;
  ALTER TABLE "_homepage_v" ADD COLUMN "version_bubble_color" varchar;
  ALTER TABLE "_homepage_v" ADD COLUMN "version_text_color" varchar;
  ALTER TABLE "_homepage_v" ADD COLUMN "version_link_color" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "navigation" DROP COLUMN "sidebar_background";
  ALTER TABLE "navigation" DROP COLUMN "wordmark_color";
  ALTER TABLE "navigation" DROP COLUMN "wordmark_dot_color";
  ALTER TABLE "navigation" DROP COLUMN "menu_color";
  ALTER TABLE "navigation" DROP COLUMN "menu_active_color";
  ALTER TABLE "navigation" DROP COLUMN "menu_font_size";
  ALTER TABLE "navigation" DROP COLUMN "wordmark_font_size";
  ALTER TABLE "homepage" DROP COLUMN "page_background";
  ALTER TABLE "homepage" DROP COLUMN "bubble_color";
  ALTER TABLE "homepage" DROP COLUMN "text_color";
  ALTER TABLE "homepage" DROP COLUMN "link_color";
  ALTER TABLE "_homepage_v" DROP COLUMN "version_page_background";
  ALTER TABLE "_homepage_v" DROP COLUMN "version_bubble_color";
  ALTER TABLE "_homepage_v" DROP COLUMN "version_text_color";
  ALTER TABLE "_homepage_v" DROP COLUMN "version_link_color";`)
}
