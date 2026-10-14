import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_projects_blocks_gallery_layout" AS ENUM('stack', 'two', 'three');
  CREATE TYPE "public"."enum_projects_blocks_code_language" AS ENUM('typescript', 'javascript', 'css');
  CREATE TYPE "public"."enum_projects_kind" AS ENUM('personal', 'contribution', 'professional', 'academic', 'experiment');
  CREATE TYPE "public"."enum_projects_layout_preset" AS ENUM('case-study', 'article');
  CREATE TYPE "public"."enum_projects_accent" AS ENUM('blue', 'orange', 'green', 'violet', 'neutral');
  CREATE TYPE "public"."enum_projects_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_blocks_gallery_layout" AS ENUM('stack', 'two', 'three');
  CREATE TYPE "public"."enum__projects_v_blocks_code_language" AS ENUM('typescript', 'javascript', 'css');
  CREATE TYPE "public"."enum__projects_v_version_kind" AS ENUM('personal', 'contribution', 'professional', 'academic', 'experiment');
  CREATE TYPE "public"."enum__projects_v_version_layout_preset" AS ENUM('case-study', 'article');
  CREATE TYPE "public"."enum__projects_v_version_accent" AS ENUM('blue', 'orange', 'green', 'violet', 'neutral');
  CREATE TYPE "public"."enum__projects_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_pages_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_gallery_layout" AS ENUM('stack', 'two', 'three');
  CREATE TYPE "public"."enum_pages_blocks_code_language" AS ENUM('typescript', 'javascript', 'css');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_version_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_gallery_layout" AS ENUM('stack', 'two', 'three');
  CREATE TYPE "public"."enum__pages_v_blocks_code_language" AS ENUM('typescript', 'javascript', 'css');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_version_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_publications_kind" AS ENUM('conference', 'journal', 'preprint', 'other');
  CREATE TYPE "public"."enum_publications_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__publications_v_version_kind" AS ENUM('conference', 'journal', 'preprint', 'other');
  CREATE TYPE "public"."enum__publications_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_experience_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__experience_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_education_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__education_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_certifications_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__certifications_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_redirects_to_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_forms_confirmation_type" AS ENUM('message', 'redirect');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_folders_folder_type" AS ENUM('media');
  CREATE TYPE "public"."enum_homepage_messages_style" AS ENUM('default', 'accent', 'muted');
  CREATE TYPE "public"."enum_homepage_animation_preset" AS ENUM('calm', 'snappy', 'instant');
  CREATE TYPE "public"."enum_homepage_typing_indicator" AS ENUM('dots', 'none');
  CREATE TYPE "public"."enum_homepage_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__homepage_v_version_messages_style" AS ENUM('default', 'accent', 'muted');
  CREATE TYPE "public"."enum__homepage_v_version_animation_preset" AS ENUM('calm', 'snappy', 'instant');
  CREATE TYPE "public"."enum__homepage_v_version_typing_indicator" AS ENUM('dots', 'none');
  CREATE TYPE "public"."enum__homepage_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_about_sections_kind" AS ENUM('text', 'experience', 'education', 'projects', 'publications', 'certifications', 'technologies');
  CREATE TYPE "public"."enum_about_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__about_v_version_sections_kind" AS ENUM('text', 'experience', 'education', 'projects', 'publications', 'certifications', 'technologies');
  CREATE TYPE "public"."enum__about_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_appearance_theme" AS ENUM('dark', 'light');
  CREATE TYPE "public"."enum_appearance_accent" AS ENUM('blue', 'orange', 'green', 'violet', 'neutral');
  CREATE TYPE "public"."enum_appearance_font_preset" AS ENUM('inter', 'geist', 'system');
  CREATE TYPE "public"."enum_appearance_heading_scale" AS ENUM('compact', 'regular', 'large');
  CREATE TYPE "public"."enum_appearance_spacing" AS ENUM('tight', 'regular', 'airy');
  CREATE TYPE "public"."enum_appearance_radius" AS ENUM('pill', 'rounded', 'square');
  CREATE TYPE "public"."enum_appearance_link_style" AS ENUM('underline', 'plain');
  CREATE TYPE "public"."enum_appearance_bubble_style" AS ENUM('pill', 'rounded');
  CREATE TYPE "public"."enum_appearance_animation_intensity" AS ENUM('reduced', 'normal', 'expressive');
  CREATE TYPE "public"."enum_appearance_animation_speed" AS ENUM('slow', 'normal', 'fast');
  CREATE TYPE "public"."enum_appearance_project_display_style" AS ENUM('explorer', 'grid');
  CREATE TABLE "projects_technologies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar
  );
  
  CREATE TABLE "projects_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar
  );
  
  CREATE TABLE "projects_screenshots" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "projects_blocks_prose" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"rich_text" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "projects_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"layout" "enum_projects_blocks_gallery_layout" DEFAULT 'stack',
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_code" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"language" "enum_projects_blocks_code_language" DEFAULT 'typescript',
  	"code" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_features_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "projects_blocks_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'What it does',
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_timeline_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"when" varchar,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "projects_blocks_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Timeline',
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_links_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"note" varchar
  );
  
  CREATE TABLE "projects_blocks_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Links',
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "projects_blocks_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Facts',
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"summary" varchar,
  	"description" varchar,
  	"kind" "enum_projects_kind" DEFAULT 'personal',
  	"category" varchar,
  	"year" varchar,
  	"role" varchar,
  	"client" varchar,
  	"start_date" timestamp(3) with time zone,
  	"completion_date" timestamp(3) with time zone,
  	"thumbnail_id" integer,
  	"hero_image_id" integer,
  	"hero_video_id" integer,
  	"demo_video_url" varchar,
  	"layout_preset" "enum_projects_layout_preset" DEFAULT 'case-study',
  	"github_url" varchar,
  	"live_demo_url" varchar,
  	"documentation_url" varchar,
  	"releases_url" varchar,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"featured" boolean DEFAULT false,
  	"archived" boolean DEFAULT false,
  	"display_order" numeric DEFAULT 0,
  	"accent" "enum_projects_accent" DEFAULT 'blue',
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_projects_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_projects_v_version_technologies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_version_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_version_screenshots" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_prose" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"rich_text" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"layout" "enum__projects_v_blocks_gallery_layout" DEFAULT 'stack',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_code" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"language" "enum__projects_v_blocks_code_language" DEFAULT 'typescript',
  	"code" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_features_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'What it does',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_timeline_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"when" varchar,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Timeline',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_links_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"note" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Links',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Facts',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_summary" varchar,
  	"version_description" varchar,
  	"version_kind" "enum__projects_v_version_kind" DEFAULT 'personal',
  	"version_category" varchar,
  	"version_year" varchar,
  	"version_role" varchar,
  	"version_client" varchar,
  	"version_start_date" timestamp(3) with time zone,
  	"version_completion_date" timestamp(3) with time zone,
  	"version_thumbnail_id" integer,
  	"version_hero_image_id" integer,
  	"version_hero_video_id" integer,
  	"version_demo_video_url" varchar,
  	"version_layout_preset" "enum__projects_v_version_layout_preset" DEFAULT 'case-study',
  	"version_github_url" varchar,
  	"version_live_demo_url" varchar,
  	"version_documentation_url" varchar,
  	"version_releases_url" varchar,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_featured" boolean DEFAULT false,
  	"version_archived" boolean DEFAULT false,
  	"version_display_order" numeric DEFAULT 0,
  	"version_accent" "enum__projects_v_version_accent" DEFAULT 'blue',
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__projects_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "posts_populated_authors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"hero_image_id" integer,
  	"content" jsonb,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"published_at" timestamp(3) with time zone,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer,
  	"categories_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "_posts_v_version_populated_authors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"name" varchar
  );
  
  CREATE TABLE "_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_hero_image_id" integer,
  	"version_content" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_posts_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer,
  	"categories_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "pages_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_hero_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_prose" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"rich_text" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "pages_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"layout" "enum_pages_blocks_gallery_layout" DEFAULT 'stack',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_code" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"language" "enum_pages_blocks_code_language" DEFAULT 'typescript',
  	"code" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_features_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'What it does',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_links_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"note" varchar
  );
  
  CREATE TABLE "pages_blocks_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Links',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_timeline_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"when" varchar,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Timeline',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_pages_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum_pages_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_blocks_content_columns_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_blocks_cta_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"enable_intro" boolean,
  	"intro_content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"hero_type" "enum_pages_hero_type" DEFAULT 'lowImpact',
  	"hero_rich_text" jsonb,
  	"hero_media_id" integer,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"published_at" timestamp(3) with time zone,
  	"show_in_navigation" boolean DEFAULT false,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer
  );
  
  CREATE TABLE "_pages_v_version_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_version_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__pages_v_version_hero_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_prose" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"rich_text" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"layout" "enum__pages_v_blocks_gallery_layout" DEFAULT 'stack',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_code" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"language" "enum__pages_v_blocks_code_language" DEFAULT 'typescript',
  	"code" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_features_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'What it does',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_links_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"note" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Links',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_timeline_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"when" varchar,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Timeline',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"size" "enum__pages_v_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum__pages_v_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__pages_v_blocks_content_columns_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__pages_v_blocks_cta_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"enable_intro" boolean,
  	"intro_content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_hero_type" "enum__pages_v_version_hero_type" DEFAULT 'lowImpact',
  	"version_hero_rich_text" jsonb,
  	"version_hero_media_id" integer,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_show_in_navigation" boolean DEFAULT false,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer
  );
  
  CREATE TABLE "publications_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar
  );
  
  CREATE TABLE "publications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"authors" varchar,
  	"year" numeric,
  	"publisher" varchar,
  	"kind" "enum_publications_kind" DEFAULT 'conference',
  	"venue" varchar,
  	"doi" varchar,
  	"external_url" varchar,
  	"abstract" varchar,
  	"personal_contribution" varchar,
  	"featured" boolean DEFAULT false,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_publications_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_publications_v_version_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_publications_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_authors" varchar,
  	"version_year" numeric,
  	"version_publisher" varchar,
  	"version_kind" "enum__publications_v_version_kind" DEFAULT 'conference',
  	"version_venue" varchar,
  	"version_doi" varchar,
  	"version_external_url" varchar,
  	"version_abstract" varchar,
  	"version_personal_contribution" varchar,
  	"version_featured" boolean DEFAULT false,
  	"version_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__publications_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "experience_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "experience_technologies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar
  );
  
  CREATE TABLE "experience" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" varchar,
  	"company" varchar,
  	"company_url" varchar,
  	"location" varchar,
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"current" boolean DEFAULT false,
  	"summary" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_experience_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_experience_v_version_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_experience_v_version_technologies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_experience_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_role" varchar,
  	"version_company" varchar,
  	"version_company_url" varchar,
  	"version_location" varchar,
  	"version_start_date" timestamp(3) with time zone,
  	"version_end_date" timestamp(3) with time zone,
  	"version_current" boolean DEFAULT false,
  	"version_summary" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__experience_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "education" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"institution" varchar,
  	"degree" varchar,
  	"field" varchar,
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"location" varchar,
  	"notes" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_education_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_education_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_institution" varchar,
  	"version_degree" varchar,
  	"version_field" varchar,
  	"version_start_date" timestamp(3) with time zone,
  	"version_end_date" timestamp(3) with time zone,
  	"version_location" varchar,
  	"version_notes" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__education_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "certifications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"issuer" varchar,
  	"year" varchar,
  	"url" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_certifications_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_certifications_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_issuer" varchar,
  	"version_year" varchar,
  	"version_url" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__certifications_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"caption" jsonb,
  	"folder_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_square_url" varchar,
  	"sizes_square_width" numeric,
  	"sizes_square_height" numeric,
  	"sizes_square_mime_type" varchar,
  	"sizes_square_filesize" numeric,
  	"sizes_square_filename" varchar,
  	"sizes_small_url" varchar,
  	"sizes_small_width" numeric,
  	"sizes_small_height" numeric,
  	"sizes_small_mime_type" varchar,
  	"sizes_small_filesize" numeric,
  	"sizes_small_filename" varchar,
  	"sizes_medium_url" varchar,
  	"sizes_medium_width" numeric,
  	"sizes_medium_height" numeric,
  	"sizes_medium_mime_type" varchar,
  	"sizes_medium_filesize" numeric,
  	"sizes_medium_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar,
  	"sizes_xlarge_url" varchar,
  	"sizes_xlarge_width" numeric,
  	"sizes_xlarge_height" numeric,
  	"sizes_xlarge_mime_type" varchar,
  	"sizes_xlarge_filesize" numeric,
  	"sizes_xlarge_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
  );
  
  CREATE TABLE "categories_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"doc_id" integer,
  	"url" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"parent_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" varchar NOT NULL,
  	"to_type" "enum_redirects_to_type" DEFAULT 'reference',
  	"to_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "redirects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer
  );
  
  CREATE TABLE "forms_blocks_checkbox" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"required" boolean,
  	"default_value" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_country" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_email" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_message" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"message" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_number" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"default_value" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_select_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_select" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"default_value" varchar,
  	"placeholder" varchar,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_state" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"default_value" varchar,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_textarea" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"default_value" varchar,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_emails" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"email_to" varchar,
  	"cc" varchar,
  	"bcc" varchar,
  	"reply_to" varchar,
  	"email_from" varchar,
  	"subject" varchar DEFAULT 'You''ve received a new message.' NOT NULL,
  	"message" jsonb
  );
  
  CREATE TABLE "forms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"submit_button_label" varchar,
  	"confirmation_type" "enum_forms_confirmation_type" DEFAULT 'message',
  	"confirmation_message" jsonb,
  	"redirect_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "form_submissions_submission_data" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "form_submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "search_categories" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"relation_to" varchar,
  	"category_i_d" varchar,
  	"title" varchar
  );
  
  CREATE TABLE "search" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"priority" numeric,
  	"slug" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "search_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_folders_folder_type" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_payload_folders_folder_type",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "payload_folders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"folder_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"projects_id" integer,
  	"posts_id" integer,
  	"pages_id" integer,
  	"publications_id" integer,
  	"experience_id" integer,
  	"education_id" integer,
  	"certifications_id" integer,
  	"media_id" integer,
  	"categories_id" integer,
  	"users_id" integer,
  	"redirects_id" integer,
  	"forms_id" integer,
  	"form_submissions_id" integer,
  	"search_id" integer,
  	"payload_folders_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "homepage_messages_choices" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "homepage_messages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" varchar,
  	"style" "enum_homepage_messages_style" DEFAULT 'default',
  	"reveal_delay" numeric,
  	"enabled" boolean DEFAULT true
  );
  
  CREATE TABLE "homepage" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"animation_preset" "enum_homepage_animation_preset" DEFAULT 'calm',
  	"typing_indicator" "enum_homepage_typing_indicator" DEFAULT 'dots',
  	"start_delay" numeric DEFAULT 400,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"_status" "enum_homepage_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_homepage_v_version_messages_choices" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_version_messages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" varchar,
  	"style" "enum__homepage_v_version_messages_style" DEFAULT 'default',
  	"reveal_delay" numeric,
  	"enabled" boolean DEFAULT true,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_animation_preset" "enum__homepage_v_version_animation_preset" DEFAULT 'calm',
  	"version_typing_indicator" "enum__homepage_v_version_typing_indicator" DEFAULT 'dots',
  	"version_start_delay" numeric DEFAULT 400,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version__status" "enum__homepage_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "navigation_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL,
  	"visible" boolean DEFAULT true,
  	"new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "navigation_footer_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "about_sections_technology_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"items" varchar
  );
  
  CREATE TABLE "about_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"kind" "enum_about_sections_kind" DEFAULT 'text',
  	"visible" boolean DEFAULT true,
  	"body" jsonb
  );
  
  CREATE TABLE "about" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'About',
  	"title" varchar DEFAULT 'Sheetaldharshan A',
  	"intro" varchar,
  	"photo_id" integer,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"_status" "enum_about_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_about_v_version_sections_technology_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"items" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_about_v_version_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"kind" "enum__about_v_version_sections_kind" DEFAULT 'text',
  	"visible" boolean DEFAULT true,
  	"body" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_about_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_eyebrow" varchar DEFAULT 'About',
  	"version_title" varchar DEFAULT 'Sheetaldharshan A',
  	"version_intro" varchar,
  	"version_photo_id" integer,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version__status" "enum__about_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "appearance" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"theme" "enum_appearance_theme" DEFAULT 'dark',
  	"accent" "enum_appearance_accent" DEFAULT 'blue',
  	"font_preset" "enum_appearance_font_preset" DEFAULT 'inter',
  	"heading_scale" "enum_appearance_heading_scale" DEFAULT 'regular',
  	"spacing" "enum_appearance_spacing" DEFAULT 'regular',
  	"radius" "enum_appearance_radius" DEFAULT 'pill',
  	"link_style" "enum_appearance_link_style" DEFAULT 'underline',
  	"bubble_style" "enum_appearance_bubble_style" DEFAULT 'pill',
  	"animation_intensity" "enum_appearance_animation_intensity" DEFAULT 'normal',
  	"animation_speed" "enum_appearance_animation_speed" DEFAULT 'normal',
  	"project_display_style" "enum_appearance_project_display_style" DEFAULT 'explorer',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"display_name" varchar DEFAULT 'Sheetaldharshan',
  	"full_name" varchar DEFAULT 'Sheetaldharshan A',
  	"tagline" varchar DEFAULT 'I build developer tools and AI agents that work over real databases.',
  	"description" varchar DEFAULT 'Software engineer at Exasol. Developer tools and AI agents that work over real databases.',
  	"canonical_url" varchar DEFAULT 'https://sheetaldharshan.me',
  	"current_role" varchar DEFAULT 'Software Engineer at Exasol',
  	"location" varchar DEFAULT 'Chennai, India',
  	"email" varchar,
  	"contact_form_enabled" boolean DEFAULT false,
  	"resume_id" integer,
  	"og_image_id" integer,
  	"footer_note" varchar DEFAULT 'Built with Next.js and Payload. Content managed from /admin.',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "projects_technologies" ADD CONSTRAINT "projects_technologies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_tags" ADD CONSTRAINT "projects_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_screenshots" ADD CONSTRAINT "projects_screenshots_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_screenshots" ADD CONSTRAINT "projects_screenshots_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_prose" ADD CONSTRAINT "projects_blocks_prose_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_media_block" ADD CONSTRAINT "projects_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_media_block" ADD CONSTRAINT "projects_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_gallery_items" ADD CONSTRAINT "projects_blocks_gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_gallery_items" ADD CONSTRAINT "projects_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_gallery" ADD CONSTRAINT "projects_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_code" ADD CONSTRAINT "projects_blocks_code_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_features_items" ADD CONSTRAINT "projects_blocks_features_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_blocks_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_features" ADD CONSTRAINT "projects_blocks_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_timeline_items" ADD CONSTRAINT "projects_blocks_timeline_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_timeline" ADD CONSTRAINT "projects_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_links_items" ADD CONSTRAINT "projects_blocks_links_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_blocks_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_links" ADD CONSTRAINT "projects_blocks_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_stats_items" ADD CONSTRAINT "projects_blocks_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_stats" ADD CONSTRAINT "projects_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_embed" ADD CONSTRAINT "projects_blocks_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_hero_video_id_media_id_fk" FOREIGN KEY ("hero_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_version_technologies" ADD CONSTRAINT "_projects_v_version_technologies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_tags" ADD CONSTRAINT "_projects_v_version_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_screenshots" ADD CONSTRAINT "_projects_v_version_screenshots_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_version_screenshots" ADD CONSTRAINT "_projects_v_version_screenshots_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_prose" ADD CONSTRAINT "_projects_v_blocks_prose_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_media_block" ADD CONSTRAINT "_projects_v_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_media_block" ADD CONSTRAINT "_projects_v_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_gallery_items" ADD CONSTRAINT "_projects_v_blocks_gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_gallery_items" ADD CONSTRAINT "_projects_v_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_gallery" ADD CONSTRAINT "_projects_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_code" ADD CONSTRAINT "_projects_v_blocks_code_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_features_items" ADD CONSTRAINT "_projects_v_blocks_features_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_blocks_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_features" ADD CONSTRAINT "_projects_v_blocks_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_timeline_items" ADD CONSTRAINT "_projects_v_blocks_timeline_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_timeline" ADD CONSTRAINT "_projects_v_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_links_items" ADD CONSTRAINT "_projects_v_blocks_links_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_blocks_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_links" ADD CONSTRAINT "_projects_v_blocks_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_stats_items" ADD CONSTRAINT "_projects_v_blocks_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_stats" ADD CONSTRAINT "_projects_v_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_embed" ADD CONSTRAINT "_projects_v_blocks_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_parent_id_projects_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_thumbnail_id_media_id_fk" FOREIGN KEY ("version_thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_hero_video_id_media_id_fk" FOREIGN KEY ("version_hero_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_populated_authors" ADD CONSTRAINT "posts_populated_authors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_version_populated_authors" ADD CONSTRAINT "_posts_v_version_populated_authors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_hero_links" ADD CONSTRAINT "pages_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_prose" ADD CONSTRAINT "pages_blocks_prose_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_block" ADD CONSTRAINT "pages_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_block" ADD CONSTRAINT "pages_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery_items" ADD CONSTRAINT "pages_blocks_gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery_items" ADD CONSTRAINT "pages_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery" ADD CONSTRAINT "pages_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_code" ADD CONSTRAINT "pages_blocks_code_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_features_items" ADD CONSTRAINT "pages_blocks_features_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_features" ADD CONSTRAINT "pages_blocks_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_links_items" ADD CONSTRAINT "pages_blocks_links_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_links" ADD CONSTRAINT "pages_blocks_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_timeline_items" ADD CONSTRAINT "pages_blocks_timeline_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_timeline" ADD CONSTRAINT "pages_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_embed" ADD CONSTRAINT "pages_blocks_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_content_columns" ADD CONSTRAINT "pages_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_content" ADD CONSTRAINT "pages_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_links" ADD CONSTRAINT "pages_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta" ADD CONSTRAINT "pages_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_form_block" ADD CONSTRAINT "pages_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_form_block" ADD CONSTRAINT "pages_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_media_id_media_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_hero_links" ADD CONSTRAINT "_pages_v_version_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_prose" ADD CONSTRAINT "_pages_v_blocks_prose_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media_block" ADD CONSTRAINT "_pages_v_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media_block" ADD CONSTRAINT "_pages_v_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery_items" ADD CONSTRAINT "_pages_v_blocks_gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery_items" ADD CONSTRAINT "_pages_v_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery" ADD CONSTRAINT "_pages_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_code" ADD CONSTRAINT "_pages_v_blocks_code_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_features_items" ADD CONSTRAINT "_pages_v_blocks_features_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_features" ADD CONSTRAINT "_pages_v_blocks_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_links_items" ADD CONSTRAINT "_pages_v_blocks_links_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_links" ADD CONSTRAINT "_pages_v_blocks_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_timeline_items" ADD CONSTRAINT "_pages_v_blocks_timeline_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_timeline" ADD CONSTRAINT "_pages_v_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_embed" ADD CONSTRAINT "_pages_v_blocks_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD CONSTRAINT "_pages_v_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content" ADD CONSTRAINT "_pages_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_links" ADD CONSTRAINT "_pages_v_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta" ADD CONSTRAINT "_pages_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_form_block" ADD CONSTRAINT "_pages_v_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_form_block" ADD CONSTRAINT "_pages_v_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_media_id_media_id_fk" FOREIGN KEY ("version_hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "publications_tags" ADD CONSTRAINT "publications_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."publications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_publications_v_version_tags" ADD CONSTRAINT "_publications_v_version_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_publications_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_publications_v" ADD CONSTRAINT "_publications_v_parent_id_publications_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."publications"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "experience_highlights" ADD CONSTRAINT "experience_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."experience"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experience_technologies" ADD CONSTRAINT "experience_technologies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."experience"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experience_v_version_highlights" ADD CONSTRAINT "_experience_v_version_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_experience_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experience_v_version_technologies" ADD CONSTRAINT "_experience_v_version_technologies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_experience_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experience_v" ADD CONSTRAINT "_experience_v_parent_id_experience_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."experience"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_education_v" ADD CONSTRAINT "_education_v_parent_id_education_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."education"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_certifications_v" ADD CONSTRAINT "_certifications_v_parent_id_certifications_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."certifications"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_folder_id_payload_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."payload_folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories_breadcrumbs" ADD CONSTRAINT "categories_breadcrumbs_doc_id_categories_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories_breadcrumbs" ADD CONSTRAINT "categories_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_checkbox" ADD CONSTRAINT "forms_blocks_checkbox_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_country" ADD CONSTRAINT "forms_blocks_country_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_email" ADD CONSTRAINT "forms_blocks_email_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_message" ADD CONSTRAINT "forms_blocks_message_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_number" ADD CONSTRAINT "forms_blocks_number_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_select_options" ADD CONSTRAINT "forms_blocks_select_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_select"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_select" ADD CONSTRAINT "forms_blocks_select_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_state" ADD CONSTRAINT "forms_blocks_state_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_text" ADD CONSTRAINT "forms_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_textarea" ADD CONSTRAINT "forms_blocks_textarea_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_emails" ADD CONSTRAINT "forms_emails_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_submissions_submission_data" ADD CONSTRAINT "form_submissions_submission_data_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "search_categories" ADD CONSTRAINT "search_categories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search" ADD CONSTRAINT "search_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_folders_folder_type" ADD CONSTRAINT "payload_folders_folder_type_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_folders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_folders" ADD CONSTRAINT "payload_folders_folder_id_payload_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."payload_folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_publications_fk" FOREIGN KEY ("publications_id") REFERENCES "public"."publications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_experience_fk" FOREIGN KEY ("experience_id") REFERENCES "public"."experience"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_education_fk" FOREIGN KEY ("education_id") REFERENCES "public"."education"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_certifications_fk" FOREIGN KEY ("certifications_id") REFERENCES "public"."certifications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_forms_fk" FOREIGN KEY ("forms_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_form_submissions_fk" FOREIGN KEY ("form_submissions_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_search_fk" FOREIGN KEY ("search_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payload_folders_fk" FOREIGN KEY ("payload_folders_id") REFERENCES "public"."payload_folders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_messages_choices" ADD CONSTRAINT "homepage_messages_choices_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_messages" ADD CONSTRAINT "homepage_messages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_messages_choices" ADD CONSTRAINT "_homepage_v_version_messages_choices_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v_version_messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_messages" ADD CONSTRAINT "_homepage_v_version_messages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_links" ADD CONSTRAINT "navigation_footer_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_sections_technology_groups" ADD CONSTRAINT "about_sections_technology_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_sections" ADD CONSTRAINT "about_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about" ADD CONSTRAINT "about_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_about_v_version_sections_technology_groups" ADD CONSTRAINT "_about_v_version_sections_technology_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_about_v_version_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_about_v_version_sections" ADD CONSTRAINT "_about_v_version_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_about_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_about_v" ADD CONSTRAINT "_about_v_version_photo_id_media_id_fk" FOREIGN KEY ("version_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_social_links" ADD CONSTRAINT "site_settings_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_resume_id_media_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "projects_technologies_order_idx" ON "projects_technologies" USING btree ("_order");
  CREATE INDEX "projects_technologies_parent_id_idx" ON "projects_technologies" USING btree ("_parent_id");
  CREATE INDEX "projects_tags_order_idx" ON "projects_tags" USING btree ("_order");
  CREATE INDEX "projects_tags_parent_id_idx" ON "projects_tags" USING btree ("_parent_id");
  CREATE INDEX "projects_screenshots_order_idx" ON "projects_screenshots" USING btree ("_order");
  CREATE INDEX "projects_screenshots_parent_id_idx" ON "projects_screenshots" USING btree ("_parent_id");
  CREATE INDEX "projects_screenshots_media_idx" ON "projects_screenshots" USING btree ("media_id");
  CREATE INDEX "projects_blocks_prose_order_idx" ON "projects_blocks_prose" USING btree ("_order");
  CREATE INDEX "projects_blocks_prose_parent_id_idx" ON "projects_blocks_prose" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_prose_path_idx" ON "projects_blocks_prose" USING btree ("_path");
  CREATE INDEX "projects_blocks_media_block_order_idx" ON "projects_blocks_media_block" USING btree ("_order");
  CREATE INDEX "projects_blocks_media_block_parent_id_idx" ON "projects_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_media_block_path_idx" ON "projects_blocks_media_block" USING btree ("_path");
  CREATE INDEX "projects_blocks_media_block_media_idx" ON "projects_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "projects_blocks_gallery_items_order_idx" ON "projects_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "projects_blocks_gallery_items_parent_id_idx" ON "projects_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_gallery_items_media_idx" ON "projects_blocks_gallery_items" USING btree ("media_id");
  CREATE INDEX "projects_blocks_gallery_order_idx" ON "projects_blocks_gallery" USING btree ("_order");
  CREATE INDEX "projects_blocks_gallery_parent_id_idx" ON "projects_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_gallery_path_idx" ON "projects_blocks_gallery" USING btree ("_path");
  CREATE INDEX "projects_blocks_code_order_idx" ON "projects_blocks_code" USING btree ("_order");
  CREATE INDEX "projects_blocks_code_parent_id_idx" ON "projects_blocks_code" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_code_path_idx" ON "projects_blocks_code" USING btree ("_path");
  CREATE INDEX "projects_blocks_features_items_order_idx" ON "projects_blocks_features_items" USING btree ("_order");
  CREATE INDEX "projects_blocks_features_items_parent_id_idx" ON "projects_blocks_features_items" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_features_order_idx" ON "projects_blocks_features" USING btree ("_order");
  CREATE INDEX "projects_blocks_features_parent_id_idx" ON "projects_blocks_features" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_features_path_idx" ON "projects_blocks_features" USING btree ("_path");
  CREATE INDEX "projects_blocks_timeline_items_order_idx" ON "projects_blocks_timeline_items" USING btree ("_order");
  CREATE INDEX "projects_blocks_timeline_items_parent_id_idx" ON "projects_blocks_timeline_items" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_timeline_order_idx" ON "projects_blocks_timeline" USING btree ("_order");
  CREATE INDEX "projects_blocks_timeline_parent_id_idx" ON "projects_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_timeline_path_idx" ON "projects_blocks_timeline" USING btree ("_path");
  CREATE INDEX "projects_blocks_links_items_order_idx" ON "projects_blocks_links_items" USING btree ("_order");
  CREATE INDEX "projects_blocks_links_items_parent_id_idx" ON "projects_blocks_links_items" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_links_order_idx" ON "projects_blocks_links" USING btree ("_order");
  CREATE INDEX "projects_blocks_links_parent_id_idx" ON "projects_blocks_links" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_links_path_idx" ON "projects_blocks_links" USING btree ("_path");
  CREATE INDEX "projects_blocks_stats_items_order_idx" ON "projects_blocks_stats_items" USING btree ("_order");
  CREATE INDEX "projects_blocks_stats_items_parent_id_idx" ON "projects_blocks_stats_items" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_stats_order_idx" ON "projects_blocks_stats" USING btree ("_order");
  CREATE INDEX "projects_blocks_stats_parent_id_idx" ON "projects_blocks_stats" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_stats_path_idx" ON "projects_blocks_stats" USING btree ("_path");
  CREATE INDEX "projects_blocks_embed_order_idx" ON "projects_blocks_embed" USING btree ("_order");
  CREATE INDEX "projects_blocks_embed_parent_id_idx" ON "projects_blocks_embed" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_embed_path_idx" ON "projects_blocks_embed" USING btree ("_path");
  CREATE INDEX "projects_thumbnail_idx" ON "projects" USING btree ("thumbnail_id");
  CREATE INDEX "projects_hero_image_idx" ON "projects" USING btree ("hero_image_id");
  CREATE INDEX "projects_hero_video_idx" ON "projects" USING btree ("hero_video_id");
  CREATE INDEX "projects_meta_meta_image_idx" ON "projects" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE INDEX "projects__status_idx" ON "projects" USING btree ("_status");
  CREATE INDEX "_projects_v_version_technologies_order_idx" ON "_projects_v_version_technologies" USING btree ("_order");
  CREATE INDEX "_projects_v_version_technologies_parent_id_idx" ON "_projects_v_version_technologies" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_tags_order_idx" ON "_projects_v_version_tags" USING btree ("_order");
  CREATE INDEX "_projects_v_version_tags_parent_id_idx" ON "_projects_v_version_tags" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_screenshots_order_idx" ON "_projects_v_version_screenshots" USING btree ("_order");
  CREATE INDEX "_projects_v_version_screenshots_parent_id_idx" ON "_projects_v_version_screenshots" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_screenshots_media_idx" ON "_projects_v_version_screenshots" USING btree ("media_id");
  CREATE INDEX "_projects_v_blocks_prose_order_idx" ON "_projects_v_blocks_prose" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_prose_parent_id_idx" ON "_projects_v_blocks_prose" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_prose_path_idx" ON "_projects_v_blocks_prose" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_media_block_order_idx" ON "_projects_v_blocks_media_block" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_media_block_parent_id_idx" ON "_projects_v_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_media_block_path_idx" ON "_projects_v_blocks_media_block" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_media_block_media_idx" ON "_projects_v_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "_projects_v_blocks_gallery_items_order_idx" ON "_projects_v_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_gallery_items_parent_id_idx" ON "_projects_v_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_gallery_items_media_idx" ON "_projects_v_blocks_gallery_items" USING btree ("media_id");
  CREATE INDEX "_projects_v_blocks_gallery_order_idx" ON "_projects_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_gallery_parent_id_idx" ON "_projects_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_gallery_path_idx" ON "_projects_v_blocks_gallery" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_code_order_idx" ON "_projects_v_blocks_code" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_code_parent_id_idx" ON "_projects_v_blocks_code" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_code_path_idx" ON "_projects_v_blocks_code" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_features_items_order_idx" ON "_projects_v_blocks_features_items" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_features_items_parent_id_idx" ON "_projects_v_blocks_features_items" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_features_order_idx" ON "_projects_v_blocks_features" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_features_parent_id_idx" ON "_projects_v_blocks_features" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_features_path_idx" ON "_projects_v_blocks_features" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_timeline_items_order_idx" ON "_projects_v_blocks_timeline_items" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_timeline_items_parent_id_idx" ON "_projects_v_blocks_timeline_items" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_timeline_order_idx" ON "_projects_v_blocks_timeline" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_timeline_parent_id_idx" ON "_projects_v_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_timeline_path_idx" ON "_projects_v_blocks_timeline" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_links_items_order_idx" ON "_projects_v_blocks_links_items" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_links_items_parent_id_idx" ON "_projects_v_blocks_links_items" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_links_order_idx" ON "_projects_v_blocks_links" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_links_parent_id_idx" ON "_projects_v_blocks_links" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_links_path_idx" ON "_projects_v_blocks_links" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_stats_items_order_idx" ON "_projects_v_blocks_stats_items" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_stats_items_parent_id_idx" ON "_projects_v_blocks_stats_items" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_stats_order_idx" ON "_projects_v_blocks_stats" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_stats_parent_id_idx" ON "_projects_v_blocks_stats" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_stats_path_idx" ON "_projects_v_blocks_stats" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_embed_order_idx" ON "_projects_v_blocks_embed" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_embed_parent_id_idx" ON "_projects_v_blocks_embed" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_embed_path_idx" ON "_projects_v_blocks_embed" USING btree ("_path");
  CREATE INDEX "_projects_v_parent_idx" ON "_projects_v" USING btree ("parent_id");
  CREATE INDEX "_projects_v_version_version_thumbnail_idx" ON "_projects_v" USING btree ("version_thumbnail_id");
  CREATE INDEX "_projects_v_version_version_hero_image_idx" ON "_projects_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_projects_v_version_version_hero_video_idx" ON "_projects_v" USING btree ("version_hero_video_id");
  CREATE INDEX "_projects_v_version_meta_version_meta_image_idx" ON "_projects_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_projects_v_version_version_slug_idx" ON "_projects_v" USING btree ("version_slug");
  CREATE INDEX "_projects_v_version_version_updated_at_idx" ON "_projects_v" USING btree ("version_updated_at");
  CREATE INDEX "_projects_v_version_version_created_at_idx" ON "_projects_v" USING btree ("version_created_at");
  CREATE INDEX "_projects_v_version_version__status_idx" ON "_projects_v" USING btree ("version__status");
  CREATE INDEX "_projects_v_created_at_idx" ON "_projects_v" USING btree ("created_at");
  CREATE INDEX "_projects_v_updated_at_idx" ON "_projects_v" USING btree ("updated_at");
  CREATE INDEX "_projects_v_latest_idx" ON "_projects_v" USING btree ("latest");
  CREATE INDEX "_projects_v_autosave_idx" ON "_projects_v" USING btree ("autosave");
  CREATE INDEX "posts_populated_authors_order_idx" ON "posts_populated_authors" USING btree ("_order");
  CREATE INDEX "posts_populated_authors_parent_id_idx" ON "posts_populated_authors" USING btree ("_parent_id");
  CREATE INDEX "posts_hero_image_idx" ON "posts" USING btree ("hero_image_id");
  CREATE INDEX "posts_meta_meta_image_idx" ON "posts" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE INDEX "posts_rels_order_idx" ON "posts_rels" USING btree ("order");
  CREATE INDEX "posts_rels_parent_idx" ON "posts_rels" USING btree ("parent_id");
  CREATE INDEX "posts_rels_path_idx" ON "posts_rels" USING btree ("path");
  CREATE INDEX "posts_rels_posts_id_idx" ON "posts_rels" USING btree ("posts_id");
  CREATE INDEX "posts_rels_categories_id_idx" ON "posts_rels" USING btree ("categories_id");
  CREATE INDEX "posts_rels_users_id_idx" ON "posts_rels" USING btree ("users_id");
  CREATE INDEX "_posts_v_version_populated_authors_order_idx" ON "_posts_v_version_populated_authors" USING btree ("_order");
  CREATE INDEX "_posts_v_version_populated_authors_parent_id_idx" ON "_posts_v_version_populated_authors" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_hero_image_idx" ON "_posts_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_posts_v_version_meta_version_meta_image_idx" ON "_posts_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE INDEX "_posts_v_autosave_idx" ON "_posts_v" USING btree ("autosave");
  CREATE INDEX "_posts_v_rels_order_idx" ON "_posts_v_rels" USING btree ("order");
  CREATE INDEX "_posts_v_rels_parent_idx" ON "_posts_v_rels" USING btree ("parent_id");
  CREATE INDEX "_posts_v_rels_path_idx" ON "_posts_v_rels" USING btree ("path");
  CREATE INDEX "_posts_v_rels_posts_id_idx" ON "_posts_v_rels" USING btree ("posts_id");
  CREATE INDEX "_posts_v_rels_categories_id_idx" ON "_posts_v_rels" USING btree ("categories_id");
  CREATE INDEX "_posts_v_rels_users_id_idx" ON "_posts_v_rels" USING btree ("users_id");
  CREATE INDEX "pages_hero_links_order_idx" ON "pages_hero_links" USING btree ("_order");
  CREATE INDEX "pages_hero_links_parent_id_idx" ON "pages_hero_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_prose_order_idx" ON "pages_blocks_prose" USING btree ("_order");
  CREATE INDEX "pages_blocks_prose_parent_id_idx" ON "pages_blocks_prose" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_prose_path_idx" ON "pages_blocks_prose" USING btree ("_path");
  CREATE INDEX "pages_blocks_media_block_order_idx" ON "pages_blocks_media_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_media_block_parent_id_idx" ON "pages_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_media_block_path_idx" ON "pages_blocks_media_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_media_block_media_idx" ON "pages_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "pages_blocks_gallery_items_order_idx" ON "pages_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_gallery_items_parent_id_idx" ON "pages_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_items_media_idx" ON "pages_blocks_gallery_items" USING btree ("media_id");
  CREATE INDEX "pages_blocks_gallery_order_idx" ON "pages_blocks_gallery" USING btree ("_order");
  CREATE INDEX "pages_blocks_gallery_parent_id_idx" ON "pages_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_path_idx" ON "pages_blocks_gallery" USING btree ("_path");
  CREATE INDEX "pages_blocks_code_order_idx" ON "pages_blocks_code" USING btree ("_order");
  CREATE INDEX "pages_blocks_code_parent_id_idx" ON "pages_blocks_code" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_code_path_idx" ON "pages_blocks_code" USING btree ("_path");
  CREATE INDEX "pages_blocks_features_items_order_idx" ON "pages_blocks_features_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_features_items_parent_id_idx" ON "pages_blocks_features_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_features_order_idx" ON "pages_blocks_features" USING btree ("_order");
  CREATE INDEX "pages_blocks_features_parent_id_idx" ON "pages_blocks_features" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_features_path_idx" ON "pages_blocks_features" USING btree ("_path");
  CREATE INDEX "pages_blocks_links_items_order_idx" ON "pages_blocks_links_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_links_items_parent_id_idx" ON "pages_blocks_links_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_links_order_idx" ON "pages_blocks_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_links_parent_id_idx" ON "pages_blocks_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_links_path_idx" ON "pages_blocks_links" USING btree ("_path");
  CREATE INDEX "pages_blocks_timeline_items_order_idx" ON "pages_blocks_timeline_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_timeline_items_parent_id_idx" ON "pages_blocks_timeline_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_timeline_order_idx" ON "pages_blocks_timeline" USING btree ("_order");
  CREATE INDEX "pages_blocks_timeline_parent_id_idx" ON "pages_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_timeline_path_idx" ON "pages_blocks_timeline" USING btree ("_path");
  CREATE INDEX "pages_blocks_embed_order_idx" ON "pages_blocks_embed" USING btree ("_order");
  CREATE INDEX "pages_blocks_embed_parent_id_idx" ON "pages_blocks_embed" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_embed_path_idx" ON "pages_blocks_embed" USING btree ("_path");
  CREATE INDEX "pages_blocks_content_columns_order_idx" ON "pages_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "pages_blocks_content_columns_parent_id_idx" ON "pages_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_content_order_idx" ON "pages_blocks_content" USING btree ("_order");
  CREATE INDEX "pages_blocks_content_parent_id_idx" ON "pages_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_content_path_idx" ON "pages_blocks_content" USING btree ("_path");
  CREATE INDEX "pages_blocks_cta_links_order_idx" ON "pages_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_links_parent_id_idx" ON "pages_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_order_idx" ON "pages_blocks_cta" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_parent_id_idx" ON "pages_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_path_idx" ON "pages_blocks_cta" USING btree ("_path");
  CREATE INDEX "pages_blocks_form_block_order_idx" ON "pages_blocks_form_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_form_block_parent_id_idx" ON "pages_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_form_block_path_idx" ON "pages_blocks_form_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_form_block_form_idx" ON "pages_blocks_form_block" USING btree ("form_id");
  CREATE INDEX "pages_hero_hero_media_idx" ON "pages" USING btree ("hero_media_id");
  CREATE INDEX "pages_meta_meta_image_idx" ON "pages" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_pages_id_idx" ON "pages_rels" USING btree ("pages_id");
  CREATE INDEX "pages_rels_posts_id_idx" ON "pages_rels" USING btree ("posts_id");
  CREATE INDEX "_pages_v_version_hero_links_order_idx" ON "_pages_v_version_hero_links" USING btree ("_order");
  CREATE INDEX "_pages_v_version_hero_links_parent_id_idx" ON "_pages_v_version_hero_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_prose_order_idx" ON "_pages_v_blocks_prose" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_prose_parent_id_idx" ON "_pages_v_blocks_prose" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_prose_path_idx" ON "_pages_v_blocks_prose" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_media_block_order_idx" ON "_pages_v_blocks_media_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_media_block_parent_id_idx" ON "_pages_v_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_media_block_path_idx" ON "_pages_v_blocks_media_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_media_block_media_idx" ON "_pages_v_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_gallery_items_order_idx" ON "_pages_v_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_gallery_items_parent_id_idx" ON "_pages_v_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_items_media_idx" ON "_pages_v_blocks_gallery_items" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_gallery_order_idx" ON "_pages_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_gallery_parent_id_idx" ON "_pages_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_path_idx" ON "_pages_v_blocks_gallery" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_code_order_idx" ON "_pages_v_blocks_code" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_code_parent_id_idx" ON "_pages_v_blocks_code" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_code_path_idx" ON "_pages_v_blocks_code" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_features_items_order_idx" ON "_pages_v_blocks_features_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_features_items_parent_id_idx" ON "_pages_v_blocks_features_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_features_order_idx" ON "_pages_v_blocks_features" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_features_parent_id_idx" ON "_pages_v_blocks_features" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_features_path_idx" ON "_pages_v_blocks_features" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_links_items_order_idx" ON "_pages_v_blocks_links_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_links_items_parent_id_idx" ON "_pages_v_blocks_links_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_links_order_idx" ON "_pages_v_blocks_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_links_parent_id_idx" ON "_pages_v_blocks_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_links_path_idx" ON "_pages_v_blocks_links" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_timeline_items_order_idx" ON "_pages_v_blocks_timeline_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_timeline_items_parent_id_idx" ON "_pages_v_blocks_timeline_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_timeline_order_idx" ON "_pages_v_blocks_timeline" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_timeline_parent_id_idx" ON "_pages_v_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_timeline_path_idx" ON "_pages_v_blocks_timeline" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_embed_order_idx" ON "_pages_v_blocks_embed" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_embed_parent_id_idx" ON "_pages_v_blocks_embed" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_embed_path_idx" ON "_pages_v_blocks_embed" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_content_columns_order_idx" ON "_pages_v_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_content_columns_parent_id_idx" ON "_pages_v_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_content_order_idx" ON "_pages_v_blocks_content" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_content_parent_id_idx" ON "_pages_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_content_path_idx" ON "_pages_v_blocks_content" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_cta_links_order_idx" ON "_pages_v_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_links_parent_id_idx" ON "_pages_v_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_order_idx" ON "_pages_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_parent_id_idx" ON "_pages_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_path_idx" ON "_pages_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_form_block_order_idx" ON "_pages_v_blocks_form_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_form_block_parent_id_idx" ON "_pages_v_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_form_block_path_idx" ON "_pages_v_blocks_form_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_form_block_form_idx" ON "_pages_v_blocks_form_block" USING btree ("form_id");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_hero_version_hero_media_idx" ON "_pages_v" USING btree ("version_hero_media_id");
  CREATE INDEX "_pages_v_version_meta_version_meta_image_idx" ON "_pages_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_pages_id_idx" ON "_pages_v_rels" USING btree ("pages_id");
  CREATE INDEX "_pages_v_rels_posts_id_idx" ON "_pages_v_rels" USING btree ("posts_id");
  CREATE INDEX "publications_tags_order_idx" ON "publications_tags" USING btree ("_order");
  CREATE INDEX "publications_tags_parent_id_idx" ON "publications_tags" USING btree ("_parent_id");
  CREATE INDEX "publications_updated_at_idx" ON "publications" USING btree ("updated_at");
  CREATE INDEX "publications_created_at_idx" ON "publications" USING btree ("created_at");
  CREATE INDEX "publications__status_idx" ON "publications" USING btree ("_status");
  CREATE INDEX "_publications_v_version_tags_order_idx" ON "_publications_v_version_tags" USING btree ("_order");
  CREATE INDEX "_publications_v_version_tags_parent_id_idx" ON "_publications_v_version_tags" USING btree ("_parent_id");
  CREATE INDEX "_publications_v_parent_idx" ON "_publications_v" USING btree ("parent_id");
  CREATE INDEX "_publications_v_version_version_updated_at_idx" ON "_publications_v" USING btree ("version_updated_at");
  CREATE INDEX "_publications_v_version_version_created_at_idx" ON "_publications_v" USING btree ("version_created_at");
  CREATE INDEX "_publications_v_version_version__status_idx" ON "_publications_v" USING btree ("version__status");
  CREATE INDEX "_publications_v_created_at_idx" ON "_publications_v" USING btree ("created_at");
  CREATE INDEX "_publications_v_updated_at_idx" ON "_publications_v" USING btree ("updated_at");
  CREATE INDEX "_publications_v_latest_idx" ON "_publications_v" USING btree ("latest");
  CREATE INDEX "experience_highlights_order_idx" ON "experience_highlights" USING btree ("_order");
  CREATE INDEX "experience_highlights_parent_id_idx" ON "experience_highlights" USING btree ("_parent_id");
  CREATE INDEX "experience_technologies_order_idx" ON "experience_technologies" USING btree ("_order");
  CREATE INDEX "experience_technologies_parent_id_idx" ON "experience_technologies" USING btree ("_parent_id");
  CREATE INDEX "experience_updated_at_idx" ON "experience" USING btree ("updated_at");
  CREATE INDEX "experience_created_at_idx" ON "experience" USING btree ("created_at");
  CREATE INDEX "experience__status_idx" ON "experience" USING btree ("_status");
  CREATE INDEX "_experience_v_version_highlights_order_idx" ON "_experience_v_version_highlights" USING btree ("_order");
  CREATE INDEX "_experience_v_version_highlights_parent_id_idx" ON "_experience_v_version_highlights" USING btree ("_parent_id");
  CREATE INDEX "_experience_v_version_technologies_order_idx" ON "_experience_v_version_technologies" USING btree ("_order");
  CREATE INDEX "_experience_v_version_technologies_parent_id_idx" ON "_experience_v_version_technologies" USING btree ("_parent_id");
  CREATE INDEX "_experience_v_parent_idx" ON "_experience_v" USING btree ("parent_id");
  CREATE INDEX "_experience_v_version_version_updated_at_idx" ON "_experience_v" USING btree ("version_updated_at");
  CREATE INDEX "_experience_v_version_version_created_at_idx" ON "_experience_v" USING btree ("version_created_at");
  CREATE INDEX "_experience_v_version_version__status_idx" ON "_experience_v" USING btree ("version__status");
  CREATE INDEX "_experience_v_created_at_idx" ON "_experience_v" USING btree ("created_at");
  CREATE INDEX "_experience_v_updated_at_idx" ON "_experience_v" USING btree ("updated_at");
  CREATE INDEX "_experience_v_latest_idx" ON "_experience_v" USING btree ("latest");
  CREATE INDEX "education_updated_at_idx" ON "education" USING btree ("updated_at");
  CREATE INDEX "education_created_at_idx" ON "education" USING btree ("created_at");
  CREATE INDEX "education__status_idx" ON "education" USING btree ("_status");
  CREATE INDEX "_education_v_parent_idx" ON "_education_v" USING btree ("parent_id");
  CREATE INDEX "_education_v_version_version_updated_at_idx" ON "_education_v" USING btree ("version_updated_at");
  CREATE INDEX "_education_v_version_version_created_at_idx" ON "_education_v" USING btree ("version_created_at");
  CREATE INDEX "_education_v_version_version__status_idx" ON "_education_v" USING btree ("version__status");
  CREATE INDEX "_education_v_created_at_idx" ON "_education_v" USING btree ("created_at");
  CREATE INDEX "_education_v_updated_at_idx" ON "_education_v" USING btree ("updated_at");
  CREATE INDEX "_education_v_latest_idx" ON "_education_v" USING btree ("latest");
  CREATE INDEX "certifications_updated_at_idx" ON "certifications" USING btree ("updated_at");
  CREATE INDEX "certifications_created_at_idx" ON "certifications" USING btree ("created_at");
  CREATE INDEX "certifications__status_idx" ON "certifications" USING btree ("_status");
  CREATE INDEX "_certifications_v_parent_idx" ON "_certifications_v" USING btree ("parent_id");
  CREATE INDEX "_certifications_v_version_version_updated_at_idx" ON "_certifications_v" USING btree ("version_updated_at");
  CREATE INDEX "_certifications_v_version_version_created_at_idx" ON "_certifications_v" USING btree ("version_created_at");
  CREATE INDEX "_certifications_v_version_version__status_idx" ON "_certifications_v" USING btree ("version__status");
  CREATE INDEX "_certifications_v_created_at_idx" ON "_certifications_v" USING btree ("created_at");
  CREATE INDEX "_certifications_v_updated_at_idx" ON "_certifications_v" USING btree ("updated_at");
  CREATE INDEX "_certifications_v_latest_idx" ON "_certifications_v" USING btree ("latest");
  CREATE INDEX "media_folder_idx" ON "media" USING btree ("folder_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_square_sizes_square_filename_idx" ON "media" USING btree ("sizes_square_filename");
  CREATE INDEX "media_sizes_small_sizes_small_filename_idx" ON "media" USING btree ("sizes_small_filename");
  CREATE INDEX "media_sizes_medium_sizes_medium_filename_idx" ON "media" USING btree ("sizes_medium_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE INDEX "media_sizes_xlarge_sizes_xlarge_filename_idx" ON "media" USING btree ("sizes_xlarge_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
  CREATE INDEX "categories_breadcrumbs_order_idx" ON "categories_breadcrumbs" USING btree ("_order");
  CREATE INDEX "categories_breadcrumbs_parent_id_idx" ON "categories_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX "categories_breadcrumbs_doc_idx" ON "categories_breadcrumbs" USING btree ("doc_id");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE INDEX "redirects_rels_order_idx" ON "redirects_rels" USING btree ("order");
  CREATE INDEX "redirects_rels_parent_idx" ON "redirects_rels" USING btree ("parent_id");
  CREATE INDEX "redirects_rels_path_idx" ON "redirects_rels" USING btree ("path");
  CREATE INDEX "redirects_rels_pages_id_idx" ON "redirects_rels" USING btree ("pages_id");
  CREATE INDEX "redirects_rels_posts_id_idx" ON "redirects_rels" USING btree ("posts_id");
  CREATE INDEX "forms_blocks_checkbox_order_idx" ON "forms_blocks_checkbox" USING btree ("_order");
  CREATE INDEX "forms_blocks_checkbox_parent_id_idx" ON "forms_blocks_checkbox" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_checkbox_path_idx" ON "forms_blocks_checkbox" USING btree ("_path");
  CREATE INDEX "forms_blocks_country_order_idx" ON "forms_blocks_country" USING btree ("_order");
  CREATE INDEX "forms_blocks_country_parent_id_idx" ON "forms_blocks_country" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_country_path_idx" ON "forms_blocks_country" USING btree ("_path");
  CREATE INDEX "forms_blocks_email_order_idx" ON "forms_blocks_email" USING btree ("_order");
  CREATE INDEX "forms_blocks_email_parent_id_idx" ON "forms_blocks_email" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_email_path_idx" ON "forms_blocks_email" USING btree ("_path");
  CREATE INDEX "forms_blocks_message_order_idx" ON "forms_blocks_message" USING btree ("_order");
  CREATE INDEX "forms_blocks_message_parent_id_idx" ON "forms_blocks_message" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_message_path_idx" ON "forms_blocks_message" USING btree ("_path");
  CREATE INDEX "forms_blocks_number_order_idx" ON "forms_blocks_number" USING btree ("_order");
  CREATE INDEX "forms_blocks_number_parent_id_idx" ON "forms_blocks_number" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_number_path_idx" ON "forms_blocks_number" USING btree ("_path");
  CREATE INDEX "forms_blocks_select_options_order_idx" ON "forms_blocks_select_options" USING btree ("_order");
  CREATE INDEX "forms_blocks_select_options_parent_id_idx" ON "forms_blocks_select_options" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_select_order_idx" ON "forms_blocks_select" USING btree ("_order");
  CREATE INDEX "forms_blocks_select_parent_id_idx" ON "forms_blocks_select" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_select_path_idx" ON "forms_blocks_select" USING btree ("_path");
  CREATE INDEX "forms_blocks_state_order_idx" ON "forms_blocks_state" USING btree ("_order");
  CREATE INDEX "forms_blocks_state_parent_id_idx" ON "forms_blocks_state" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_state_path_idx" ON "forms_blocks_state" USING btree ("_path");
  CREATE INDEX "forms_blocks_text_order_idx" ON "forms_blocks_text" USING btree ("_order");
  CREATE INDEX "forms_blocks_text_parent_id_idx" ON "forms_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_text_path_idx" ON "forms_blocks_text" USING btree ("_path");
  CREATE INDEX "forms_blocks_textarea_order_idx" ON "forms_blocks_textarea" USING btree ("_order");
  CREATE INDEX "forms_blocks_textarea_parent_id_idx" ON "forms_blocks_textarea" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_textarea_path_idx" ON "forms_blocks_textarea" USING btree ("_path");
  CREATE INDEX "forms_emails_order_idx" ON "forms_emails" USING btree ("_order");
  CREATE INDEX "forms_emails_parent_id_idx" ON "forms_emails" USING btree ("_parent_id");
  CREATE INDEX "forms_updated_at_idx" ON "forms" USING btree ("updated_at");
  CREATE INDEX "forms_created_at_idx" ON "forms" USING btree ("created_at");
  CREATE INDEX "form_submissions_submission_data_order_idx" ON "form_submissions_submission_data" USING btree ("_order");
  CREATE INDEX "form_submissions_submission_data_parent_id_idx" ON "form_submissions_submission_data" USING btree ("_parent_id");
  CREATE INDEX "form_submissions_form_idx" ON "form_submissions" USING btree ("form_id");
  CREATE INDEX "form_submissions_updated_at_idx" ON "form_submissions" USING btree ("updated_at");
  CREATE INDEX "form_submissions_created_at_idx" ON "form_submissions" USING btree ("created_at");
  CREATE INDEX "search_categories_order_idx" ON "search_categories" USING btree ("_order");
  CREATE INDEX "search_categories_parent_id_idx" ON "search_categories" USING btree ("_parent_id");
  CREATE INDEX "search_slug_idx" ON "search" USING btree ("slug");
  CREATE INDEX "search_meta_meta_image_idx" ON "search" USING btree ("meta_image_id");
  CREATE INDEX "search_updated_at_idx" ON "search" USING btree ("updated_at");
  CREATE INDEX "search_created_at_idx" ON "search" USING btree ("created_at");
  CREATE INDEX "search_rels_order_idx" ON "search_rels" USING btree ("order");
  CREATE INDEX "search_rels_parent_idx" ON "search_rels" USING btree ("parent_id");
  CREATE INDEX "search_rels_path_idx" ON "search_rels" USING btree ("path");
  CREATE INDEX "search_rels_posts_id_idx" ON "search_rels" USING btree ("posts_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_folders_folder_type_order_idx" ON "payload_folders_folder_type" USING btree ("order");
  CREATE INDEX "payload_folders_folder_type_parent_idx" ON "payload_folders_folder_type" USING btree ("parent_id");
  CREATE INDEX "payload_folders_name_idx" ON "payload_folders" USING btree ("name");
  CREATE INDEX "payload_folders_folder_idx" ON "payload_folders" USING btree ("folder_id");
  CREATE INDEX "payload_folders_updated_at_idx" ON "payload_folders" USING btree ("updated_at");
  CREATE INDEX "payload_folders_created_at_idx" ON "payload_folders" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_publications_id_idx" ON "payload_locked_documents_rels" USING btree ("publications_id");
  CREATE INDEX "payload_locked_documents_rels_experience_id_idx" ON "payload_locked_documents_rels" USING btree ("experience_id");
  CREATE INDEX "payload_locked_documents_rels_education_id_idx" ON "payload_locked_documents_rels" USING btree ("education_id");
  CREATE INDEX "payload_locked_documents_rels_certifications_id_idx" ON "payload_locked_documents_rels" USING btree ("certifications_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_locked_documents_rels_forms_id_idx" ON "payload_locked_documents_rels" USING btree ("forms_id");
  CREATE INDEX "payload_locked_documents_rels_form_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("form_submissions_id");
  CREATE INDEX "payload_locked_documents_rels_search_id_idx" ON "payload_locked_documents_rels" USING btree ("search_id");
  CREATE INDEX "payload_locked_documents_rels_payload_folders_id_idx" ON "payload_locked_documents_rels" USING btree ("payload_folders_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "homepage_messages_choices_order_idx" ON "homepage_messages_choices" USING btree ("_order");
  CREATE INDEX "homepage_messages_choices_parent_id_idx" ON "homepage_messages_choices" USING btree ("_parent_id");
  CREATE INDEX "homepage_messages_order_idx" ON "homepage_messages" USING btree ("_order");
  CREATE INDEX "homepage_messages_parent_id_idx" ON "homepage_messages" USING btree ("_parent_id");
  CREATE INDEX "homepage__status_idx" ON "homepage" USING btree ("_status");
  CREATE INDEX "_homepage_v_version_messages_choices_order_idx" ON "_homepage_v_version_messages_choices" USING btree ("_order");
  CREATE INDEX "_homepage_v_version_messages_choices_parent_id_idx" ON "_homepage_v_version_messages_choices" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_version_messages_order_idx" ON "_homepage_v_version_messages" USING btree ("_order");
  CREATE INDEX "_homepage_v_version_messages_parent_id_idx" ON "_homepage_v_version_messages" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_version_version__status_idx" ON "_homepage_v" USING btree ("version__status");
  CREATE INDEX "_homepage_v_created_at_idx" ON "_homepage_v" USING btree ("created_at");
  CREATE INDEX "_homepage_v_updated_at_idx" ON "_homepage_v" USING btree ("updated_at");
  CREATE INDEX "_homepage_v_latest_idx" ON "_homepage_v" USING btree ("latest");
  CREATE INDEX "navigation_items_order_idx" ON "navigation_items" USING btree ("_order");
  CREATE INDEX "navigation_items_parent_id_idx" ON "navigation_items" USING btree ("_parent_id");
  CREATE INDEX "navigation_footer_links_order_idx" ON "navigation_footer_links" USING btree ("_order");
  CREATE INDEX "navigation_footer_links_parent_id_idx" ON "navigation_footer_links" USING btree ("_parent_id");
  CREATE INDEX "about_sections_technology_groups_order_idx" ON "about_sections_technology_groups" USING btree ("_order");
  CREATE INDEX "about_sections_technology_groups_parent_id_idx" ON "about_sections_technology_groups" USING btree ("_parent_id");
  CREATE INDEX "about_sections_order_idx" ON "about_sections" USING btree ("_order");
  CREATE INDEX "about_sections_parent_id_idx" ON "about_sections" USING btree ("_parent_id");
  CREATE INDEX "about_photo_idx" ON "about" USING btree ("photo_id");
  CREATE INDEX "about__status_idx" ON "about" USING btree ("_status");
  CREATE INDEX "_about_v_version_sections_technology_groups_order_idx" ON "_about_v_version_sections_technology_groups" USING btree ("_order");
  CREATE INDEX "_about_v_version_sections_technology_groups_parent_id_idx" ON "_about_v_version_sections_technology_groups" USING btree ("_parent_id");
  CREATE INDEX "_about_v_version_sections_order_idx" ON "_about_v_version_sections" USING btree ("_order");
  CREATE INDEX "_about_v_version_sections_parent_id_idx" ON "_about_v_version_sections" USING btree ("_parent_id");
  CREATE INDEX "_about_v_version_version_photo_idx" ON "_about_v" USING btree ("version_photo_id");
  CREATE INDEX "_about_v_version_version__status_idx" ON "_about_v" USING btree ("version__status");
  CREATE INDEX "_about_v_created_at_idx" ON "_about_v" USING btree ("created_at");
  CREATE INDEX "_about_v_updated_at_idx" ON "_about_v" USING btree ("updated_at");
  CREATE INDEX "_about_v_latest_idx" ON "_about_v" USING btree ("latest");
  CREATE INDEX "site_settings_social_links_order_idx" ON "site_settings_social_links" USING btree ("_order");
  CREATE INDEX "site_settings_social_links_parent_id_idx" ON "site_settings_social_links" USING btree ("_parent_id");
  CREATE INDEX "site_settings_resume_idx" ON "site_settings" USING btree ("resume_id");
  CREATE INDEX "site_settings_og_image_idx" ON "site_settings" USING btree ("og_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "projects_technologies" CASCADE;
  DROP TABLE "projects_tags" CASCADE;
  DROP TABLE "projects_screenshots" CASCADE;
  DROP TABLE "projects_blocks_prose" CASCADE;
  DROP TABLE "projects_blocks_media_block" CASCADE;
  DROP TABLE "projects_blocks_gallery_items" CASCADE;
  DROP TABLE "projects_blocks_gallery" CASCADE;
  DROP TABLE "projects_blocks_code" CASCADE;
  DROP TABLE "projects_blocks_features_items" CASCADE;
  DROP TABLE "projects_blocks_features" CASCADE;
  DROP TABLE "projects_blocks_timeline_items" CASCADE;
  DROP TABLE "projects_blocks_timeline" CASCADE;
  DROP TABLE "projects_blocks_links_items" CASCADE;
  DROP TABLE "projects_blocks_links" CASCADE;
  DROP TABLE "projects_blocks_stats_items" CASCADE;
  DROP TABLE "projects_blocks_stats" CASCADE;
  DROP TABLE "projects_blocks_embed" CASCADE;
  DROP TABLE "projects" CASCADE;
  DROP TABLE "_projects_v_version_technologies" CASCADE;
  DROP TABLE "_projects_v_version_tags" CASCADE;
  DROP TABLE "_projects_v_version_screenshots" CASCADE;
  DROP TABLE "_projects_v_blocks_prose" CASCADE;
  DROP TABLE "_projects_v_blocks_media_block" CASCADE;
  DROP TABLE "_projects_v_blocks_gallery_items" CASCADE;
  DROP TABLE "_projects_v_blocks_gallery" CASCADE;
  DROP TABLE "_projects_v_blocks_code" CASCADE;
  DROP TABLE "_projects_v_blocks_features_items" CASCADE;
  DROP TABLE "_projects_v_blocks_features" CASCADE;
  DROP TABLE "_projects_v_blocks_timeline_items" CASCADE;
  DROP TABLE "_projects_v_blocks_timeline" CASCADE;
  DROP TABLE "_projects_v_blocks_links_items" CASCADE;
  DROP TABLE "_projects_v_blocks_links" CASCADE;
  DROP TABLE "_projects_v_blocks_stats_items" CASCADE;
  DROP TABLE "_projects_v_blocks_stats" CASCADE;
  DROP TABLE "_projects_v_blocks_embed" CASCADE;
  DROP TABLE "_projects_v" CASCADE;
  DROP TABLE "posts_populated_authors" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "posts_rels" CASCADE;
  DROP TABLE "_posts_v_version_populated_authors" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "_posts_v_rels" CASCADE;
  DROP TABLE "pages_hero_links" CASCADE;
  DROP TABLE "pages_blocks_prose" CASCADE;
  DROP TABLE "pages_blocks_media_block" CASCADE;
  DROP TABLE "pages_blocks_gallery_items" CASCADE;
  DROP TABLE "pages_blocks_gallery" CASCADE;
  DROP TABLE "pages_blocks_code" CASCADE;
  DROP TABLE "pages_blocks_features_items" CASCADE;
  DROP TABLE "pages_blocks_features" CASCADE;
  DROP TABLE "pages_blocks_links_items" CASCADE;
  DROP TABLE "pages_blocks_links" CASCADE;
  DROP TABLE "pages_blocks_timeline_items" CASCADE;
  DROP TABLE "pages_blocks_timeline" CASCADE;
  DROP TABLE "pages_blocks_embed" CASCADE;
  DROP TABLE "pages_blocks_content_columns" CASCADE;
  DROP TABLE "pages_blocks_content" CASCADE;
  DROP TABLE "pages_blocks_cta_links" CASCADE;
  DROP TABLE "pages_blocks_cta" CASCADE;
  DROP TABLE "pages_blocks_form_block" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v_version_hero_links" CASCADE;
  DROP TABLE "_pages_v_blocks_prose" CASCADE;
  DROP TABLE "_pages_v_blocks_media_block" CASCADE;
  DROP TABLE "_pages_v_blocks_gallery_items" CASCADE;
  DROP TABLE "_pages_v_blocks_gallery" CASCADE;
  DROP TABLE "_pages_v_blocks_code" CASCADE;
  DROP TABLE "_pages_v_blocks_features_items" CASCADE;
  DROP TABLE "_pages_v_blocks_features" CASCADE;
  DROP TABLE "_pages_v_blocks_links_items" CASCADE;
  DROP TABLE "_pages_v_blocks_links" CASCADE;
  DROP TABLE "_pages_v_blocks_timeline_items" CASCADE;
  DROP TABLE "_pages_v_blocks_timeline" CASCADE;
  DROP TABLE "_pages_v_blocks_embed" CASCADE;
  DROP TABLE "_pages_v_blocks_content_columns" CASCADE;
  DROP TABLE "_pages_v_blocks_content" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_links" CASCADE;
  DROP TABLE "_pages_v_blocks_cta" CASCADE;
  DROP TABLE "_pages_v_blocks_form_block" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  DROP TABLE "publications_tags" CASCADE;
  DROP TABLE "publications" CASCADE;
  DROP TABLE "_publications_v_version_tags" CASCADE;
  DROP TABLE "_publications_v" CASCADE;
  DROP TABLE "experience_highlights" CASCADE;
  DROP TABLE "experience_technologies" CASCADE;
  DROP TABLE "experience" CASCADE;
  DROP TABLE "_experience_v_version_highlights" CASCADE;
  DROP TABLE "_experience_v_version_technologies" CASCADE;
  DROP TABLE "_experience_v" CASCADE;
  DROP TABLE "education" CASCADE;
  DROP TABLE "_education_v" CASCADE;
  DROP TABLE "certifications" CASCADE;
  DROP TABLE "_certifications_v" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "categories_breadcrumbs" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "redirects_rels" CASCADE;
  DROP TABLE "forms_blocks_checkbox" CASCADE;
  DROP TABLE "forms_blocks_country" CASCADE;
  DROP TABLE "forms_blocks_email" CASCADE;
  DROP TABLE "forms_blocks_message" CASCADE;
  DROP TABLE "forms_blocks_number" CASCADE;
  DROP TABLE "forms_blocks_select_options" CASCADE;
  DROP TABLE "forms_blocks_select" CASCADE;
  DROP TABLE "forms_blocks_state" CASCADE;
  DROP TABLE "forms_blocks_text" CASCADE;
  DROP TABLE "forms_blocks_textarea" CASCADE;
  DROP TABLE "forms_emails" CASCADE;
  DROP TABLE "forms" CASCADE;
  DROP TABLE "form_submissions_submission_data" CASCADE;
  DROP TABLE "form_submissions" CASCADE;
  DROP TABLE "search_categories" CASCADE;
  DROP TABLE "search" CASCADE;
  DROP TABLE "search_rels" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_folders_folder_type" CASCADE;
  DROP TABLE "payload_folders" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "homepage_messages_choices" CASCADE;
  DROP TABLE "homepage_messages" CASCADE;
  DROP TABLE "homepage" CASCADE;
  DROP TABLE "_homepage_v_version_messages_choices" CASCADE;
  DROP TABLE "_homepage_v_version_messages" CASCADE;
  DROP TABLE "_homepage_v" CASCADE;
  DROP TABLE "navigation_items" CASCADE;
  DROP TABLE "navigation_footer_links" CASCADE;
  DROP TABLE "navigation" CASCADE;
  DROP TABLE "about_sections_technology_groups" CASCADE;
  DROP TABLE "about_sections" CASCADE;
  DROP TABLE "about" CASCADE;
  DROP TABLE "_about_v_version_sections_technology_groups" CASCADE;
  DROP TABLE "_about_v_version_sections" CASCADE;
  DROP TABLE "_about_v" CASCADE;
  DROP TABLE "appearance" CASCADE;
  DROP TABLE "site_settings_social_links" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TYPE "public"."enum_projects_blocks_gallery_layout";
  DROP TYPE "public"."enum_projects_blocks_code_language";
  DROP TYPE "public"."enum_projects_kind";
  DROP TYPE "public"."enum_projects_layout_preset";
  DROP TYPE "public"."enum_projects_accent";
  DROP TYPE "public"."enum_projects_status";
  DROP TYPE "public"."enum__projects_v_blocks_gallery_layout";
  DROP TYPE "public"."enum__projects_v_blocks_code_language";
  DROP TYPE "public"."enum__projects_v_version_kind";
  DROP TYPE "public"."enum__projects_v_version_layout_preset";
  DROP TYPE "public"."enum__projects_v_version_accent";
  DROP TYPE "public"."enum__projects_v_version_status";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_version_status";
  DROP TYPE "public"."enum_pages_hero_links_link_type";
  DROP TYPE "public"."enum_pages_hero_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_gallery_layout";
  DROP TYPE "public"."enum_pages_blocks_code_language";
  DROP TYPE "public"."enum_pages_blocks_content_columns_size";
  DROP TYPE "public"."enum_pages_blocks_content_columns_link_type";
  DROP TYPE "public"."enum_pages_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_cta_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum_pages_hero_type";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_version_hero_links_link_type";
  DROP TYPE "public"."enum__pages_v_version_hero_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_gallery_layout";
  DROP TYPE "public"."enum__pages_v_blocks_code_language";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_size";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_cta_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_version_hero_type";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum_publications_kind";
  DROP TYPE "public"."enum_publications_status";
  DROP TYPE "public"."enum__publications_v_version_kind";
  DROP TYPE "public"."enum__publications_v_version_status";
  DROP TYPE "public"."enum_experience_status";
  DROP TYPE "public"."enum__experience_v_version_status";
  DROP TYPE "public"."enum_education_status";
  DROP TYPE "public"."enum__education_v_version_status";
  DROP TYPE "public"."enum_certifications_status";
  DROP TYPE "public"."enum__certifications_v_version_status";
  DROP TYPE "public"."enum_redirects_to_type";
  DROP TYPE "public"."enum_forms_confirmation_type";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  DROP TYPE "public"."enum_payload_folders_folder_type";
  DROP TYPE "public"."enum_homepage_messages_style";
  DROP TYPE "public"."enum_homepage_animation_preset";
  DROP TYPE "public"."enum_homepage_typing_indicator";
  DROP TYPE "public"."enum_homepage_status";
  DROP TYPE "public"."enum__homepage_v_version_messages_style";
  DROP TYPE "public"."enum__homepage_v_version_animation_preset";
  DROP TYPE "public"."enum__homepage_v_version_typing_indicator";
  DROP TYPE "public"."enum__homepage_v_version_status";
  DROP TYPE "public"."enum_about_sections_kind";
  DROP TYPE "public"."enum_about_status";
  DROP TYPE "public"."enum__about_v_version_sections_kind";
  DROP TYPE "public"."enum__about_v_version_status";
  DROP TYPE "public"."enum_appearance_theme";
  DROP TYPE "public"."enum_appearance_accent";
  DROP TYPE "public"."enum_appearance_font_preset";
  DROP TYPE "public"."enum_appearance_heading_scale";
  DROP TYPE "public"."enum_appearance_spacing";
  DROP TYPE "public"."enum_appearance_radius";
  DROP TYPE "public"."enum_appearance_link_style";
  DROP TYPE "public"."enum_appearance_bubble_style";
  DROP TYPE "public"."enum_appearance_animation_intensity";
  DROP TYPE "public"."enum_appearance_animation_speed";
  DROP TYPE "public"."enum_appearance_project_display_style";`)
}
