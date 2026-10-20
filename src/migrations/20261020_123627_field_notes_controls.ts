import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_posts_interaction_comments" AS ENUM('default', 'on', 'locked', 'off');
  CREATE TYPE "public"."enum_posts_interaction_ratings" AS ENUM('default', 'on', 'off');
  CREATE TYPE "public"."enum_posts_interaction_likes" AS ENUM('default', 'on', 'off');
  CREATE TYPE "public"."enum_posts_interaction_feedback" AS ENUM('default', 'on', 'off');
  CREATE TYPE "public"."enum__posts_v_version_interaction_comments" AS ENUM('default', 'on', 'locked', 'off');
  CREATE TYPE "public"."enum__posts_v_version_interaction_ratings" AS ENUM('default', 'on', 'off');
  CREATE TYPE "public"."enum__posts_v_version_interaction_likes" AS ENUM('default', 'on', 'off');
  CREATE TYPE "public"."enum__posts_v_version_interaction_feedback" AS ENUM('default', 'on', 'off');
  ALTER TYPE "public"."enum_kb_settings_moderation" ADD VALUE 'anonymous' BEFORE 'all';
  ALTER TABLE "posts" ADD COLUMN "interaction_comments" "enum_posts_interaction_comments" DEFAULT 'default';
  ALTER TABLE "posts" ADD COLUMN "interaction_ratings" "enum_posts_interaction_ratings" DEFAULT 'default';
  ALTER TABLE "posts" ADD COLUMN "interaction_likes" "enum_posts_interaction_likes" DEFAULT 'default';
  ALTER TABLE "posts" ADD COLUMN "interaction_feedback" "enum_posts_interaction_feedback" DEFAULT 'default';
  ALTER TABLE "_posts_v" ADD COLUMN "version_interaction_comments" "enum__posts_v_version_interaction_comments" DEFAULT 'default';
  ALTER TABLE "_posts_v" ADD COLUMN "version_interaction_ratings" "enum__posts_v_version_interaction_ratings" DEFAULT 'default';
  ALTER TABLE "_posts_v" ADD COLUMN "version_interaction_likes" "enum__posts_v_version_interaction_likes" DEFAULT 'default';
  ALTER TABLE "_posts_v" ADD COLUMN "version_interaction_feedback" "enum__posts_v_version_interaction_feedback" DEFAULT 'default';
  ALTER TABLE "readers" ADD COLUMN "blocked_reason" varchar;
  ALTER TABLE "kb_settings" ADD COLUMN "anonymous" boolean DEFAULT true;
  ALTER TABLE "kb_settings" ADD COLUMN "likes" boolean DEFAULT true;
  ALTER TABLE "kb_settings" ADD COLUMN "stars" boolean DEFAULT true;
  ALTER TABLE "kb_settings" ADD COLUMN "reports" boolean DEFAULT true;
  ALTER TABLE "kb_settings" ADD COLUMN "sign_in" boolean DEFAULT true;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "kb_settings" ALTER COLUMN "moderation" SET DATA TYPE text;
  ALTER TABLE "kb_settings" ALTER COLUMN "moderation" SET DEFAULT 'auto'::text;
  DROP TYPE "public"."enum_kb_settings_moderation";
  CREATE TYPE "public"."enum_kb_settings_moderation" AS ENUM('auto', 'all');
  ALTER TABLE "kb_settings" ALTER COLUMN "moderation" SET DEFAULT 'auto'::"public"."enum_kb_settings_moderation";
  ALTER TABLE "kb_settings" ALTER COLUMN "moderation" SET DATA TYPE "public"."enum_kb_settings_moderation" USING "moderation"::"public"."enum_kb_settings_moderation";
  ALTER TABLE "posts" DROP COLUMN "interaction_comments";
  ALTER TABLE "posts" DROP COLUMN "interaction_ratings";
  ALTER TABLE "posts" DROP COLUMN "interaction_likes";
  ALTER TABLE "posts" DROP COLUMN "interaction_feedback";
  ALTER TABLE "_posts_v" DROP COLUMN "version_interaction_comments";
  ALTER TABLE "_posts_v" DROP COLUMN "version_interaction_ratings";
  ALTER TABLE "_posts_v" DROP COLUMN "version_interaction_likes";
  ALTER TABLE "_posts_v" DROP COLUMN "version_interaction_feedback";
  ALTER TABLE "readers" DROP COLUMN "blocked_reason";
  ALTER TABLE "kb_settings" DROP COLUMN "anonymous";
  ALTER TABLE "kb_settings" DROP COLUMN "likes";
  ALTER TABLE "kb_settings" DROP COLUMN "stars";
  ALTER TABLE "kb_settings" DROP COLUMN "reports";
  ALTER TABLE "kb_settings" DROP COLUMN "sign_in";
  DROP TYPE "public"."enum_posts_interaction_comments";
  DROP TYPE "public"."enum_posts_interaction_ratings";
  DROP TYPE "public"."enum_posts_interaction_likes";
  DROP TYPE "public"."enum_posts_interaction_feedback";
  DROP TYPE "public"."enum__posts_v_version_interaction_comments";
  DROP TYPE "public"."enum__posts_v_version_interaction_ratings";
  DROP TYPE "public"."enum__posts_v_version_interaction_likes";
  DROP TYPE "public"."enum__posts_v_version_interaction_feedback";`)
}
