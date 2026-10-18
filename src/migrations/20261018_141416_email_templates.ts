import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "contact_page" ADD COLUMN "from_name" varchar DEFAULT '{site} · Contact';
  ALTER TABLE "contact_page" ADD COLUMN "from_email" varchar;
  ALTER TABLE "contact_page" ADD COLUMN "email_accent" varchar DEFAULT '#ff3400';
  ALTER TABLE "contact_page" ADD COLUMN "alert_email_subject" varchar DEFAULT 'New message from {name} · {topic}';
  ALTER TABLE "contact_page" ADD COLUMN "alert_email_heading" varchar DEFAULT 'New message from {name}';
  ALTER TABLE "contact_page" ADD COLUMN "alert_email_intro" varchar DEFAULT '{name} wrote to you through the Contact page.';
  ALTER TABLE "contact_page" ADD COLUMN "alert_email_show_answers" boolean DEFAULT true;
  ALTER TABLE "contact_page" ADD COLUMN "alert_email_button" varchar DEFAULT 'Reply to {name}';
  ALTER TABLE "contact_page" ADD COLUMN "alert_email_footer" varchar DEFAULT 'Sent by the Contact page on {url}. Replying to this email answers {name} directly.';
  ALTER TABLE "contact_page" ADD COLUMN "confirm" boolean DEFAULT false;
  ALTER TABLE "contact_page" ADD COLUMN "confirm_email_subject" varchar DEFAULT 'Thanks for your message, {name}';
  ALTER TABLE "contact_page" ADD COLUMN "confirm_email_heading" varchar DEFAULT 'Thanks, {name}!';
  ALTER TABLE "contact_page" ADD COLUMN "confirm_email_intro" varchar DEFAULT 'I''ve got your message and I''ll reply to {email} soon.';
  ALTER TABLE "contact_page" ADD COLUMN "confirm_email_show_answers" boolean DEFAULT true;
  ALTER TABLE "contact_page" ADD COLUMN "confirm_email_button" varchar DEFAULT 'Visit {url}';
  ALTER TABLE "contact_page" ADD COLUMN "confirm_email_footer" varchar DEFAULT 'You''re getting this because someone used the Contact page on {url} with this address. If it wasn''t you, you can ignore this email.';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "contact_page" DROP COLUMN "from_name";
  ALTER TABLE "contact_page" DROP COLUMN "from_email";
  ALTER TABLE "contact_page" DROP COLUMN "email_accent";
  ALTER TABLE "contact_page" DROP COLUMN "alert_email_subject";
  ALTER TABLE "contact_page" DROP COLUMN "alert_email_heading";
  ALTER TABLE "contact_page" DROP COLUMN "alert_email_intro";
  ALTER TABLE "contact_page" DROP COLUMN "alert_email_show_answers";
  ALTER TABLE "contact_page" DROP COLUMN "alert_email_button";
  ALTER TABLE "contact_page" DROP COLUMN "alert_email_footer";
  ALTER TABLE "contact_page" DROP COLUMN "confirm";
  ALTER TABLE "contact_page" DROP COLUMN "confirm_email_subject";
  ALTER TABLE "contact_page" DROP COLUMN "confirm_email_heading";
  ALTER TABLE "contact_page" DROP COLUMN "confirm_email_intro";
  ALTER TABLE "contact_page" DROP COLUMN "confirm_email_show_answers";
  ALTER TABLE "contact_page" DROP COLUMN "confirm_email_button";
  ALTER TABLE "contact_page" DROP COLUMN "confirm_email_footer";`)
}
