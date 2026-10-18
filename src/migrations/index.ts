import * as migration_20261014_182700_initial from './20261014_182700_initial';
import * as migration_20261015_000000_enable_rls from './20261015_000000_enable_rls';
import * as migration_20261017_163947_coding_activity from './20261017_163947_coding_activity';
import * as migration_20261017_190000_coding_activity_placement from './20261017_190000_coding_activity_placement';
import * as migration_20261017_200000_coding_activity_open from './20261017_200000_coding_activity_open';
import * as migration_20261017_205000_pet_and_brand from './20261017_205000_pet_and_brand';
import * as migration_20261017_210000_theme_projects_style from './20261017_210000_theme_projects_style';
import * as migration_20261017_220000_sidebar_homepage_look from './20261017_220000_sidebar_homepage_look';
import * as migration_20261017_230000_pet_behaviour from './20261017_230000_pet_behaviour';
import * as migration_20261017_235000_admin_look from './20261017_235000_admin_look';
import * as migration_20261018_010000_about_photo_focal from './20261018_010000_about_photo_focal';
import * as migration_20261018_020000_admin_security from './20261018_020000_admin_security';
import * as migration_20261018_030000_user_github from './20261018_030000_user_github';
import * as migration_20261018_040000_theme_modes from './20261018_040000_theme_modes';
import * as migration_20261018_050000_carousel_seconds from './20261018_050000_carousel_seconds';
import * as migration_20261018_060000_messages from './20261018_060000_messages';
import * as migration_20261018_061000_message_phone from './20261018_061000_message_phone';
import * as migration_20261018_062000_contact_settings from './20261018_062000_contact_settings';
import * as migration_20261018_063000_contact_form_first from './20261018_063000_contact_form_first';

export const migrations = [
  {
    up: migration_20261014_182700_initial.up,
    down: migration_20261014_182700_initial.down,
    name: '20261014_182700_initial',
  },
  {
    up: migration_20261015_000000_enable_rls.up,
    down: migration_20261015_000000_enable_rls.down,
    name: '20261015_000000_enable_rls',
  },
  {
    up: migration_20261017_163947_coding_activity.up,
    down: migration_20261017_163947_coding_activity.down,
    name: '20261017_163947_coding_activity',
  },
  {
    up: migration_20261017_190000_coding_activity_placement.up,
    down: migration_20261017_190000_coding_activity_placement.down,
    name: '20261017_190000_coding_activity_placement',
  },
  {
    up: migration_20261017_200000_coding_activity_open.up,
    down: migration_20261017_200000_coding_activity_open.down,
    name: '20261017_200000_coding_activity_open',
  },
  {
    up: migration_20261017_205000_pet_and_brand.up,
    down: migration_20261017_205000_pet_and_brand.down,
    name: '20261017_205000_pet_and_brand',
  },
  {
    up: migration_20261017_210000_theme_projects_style.up,
    down: migration_20261017_210000_theme_projects_style.down,
    name: '20261017_210000_theme_projects_style',
  },
  {
    up: migration_20261017_220000_sidebar_homepage_look.up,
    down: migration_20261017_220000_sidebar_homepage_look.down,
    name: '20261017_220000_sidebar_homepage_look',
  },
  {
    up: migration_20261017_230000_pet_behaviour.up,
    down: migration_20261017_230000_pet_behaviour.down,
    name: '20261017_230000_pet_behaviour',
  },
  {
    up: migration_20261017_235000_admin_look.up,
    down: migration_20261017_235000_admin_look.down,
    name: '20261017_235000_admin_look',
  },
  {
    up: migration_20261018_010000_about_photo_focal.up,
    down: migration_20261018_010000_about_photo_focal.down,
    name: '20261018_010000_about_photo_focal',
  },
  {
    up: migration_20261018_020000_admin_security.up,
    down: migration_20261018_020000_admin_security.down,
    name: '20261018_020000_admin_security',
  },
  {
    up: migration_20261018_030000_user_github.up,
    down: migration_20261018_030000_user_github.down,
    name: '20261018_030000_user_github',
  },
  {
    up: migration_20261018_040000_theme_modes.up,
    down: migration_20261018_040000_theme_modes.down,
    name: '20261018_040000_theme_modes',
  },
  {
    up: migration_20261018_050000_carousel_seconds.up,
    down: migration_20261018_050000_carousel_seconds.down,
    name: '20261018_050000_carousel_seconds',
  },
  {
    up: migration_20261018_060000_messages.up,
    down: migration_20261018_060000_messages.down,
    name: '20261018_060000_messages',
  },
  {
    up: migration_20261018_061000_message_phone.up,
    down: migration_20261018_061000_message_phone.down,
    name: '20261018_061000_message_phone',
  },
  {
    up: migration_20261018_062000_contact_settings.up,
    down: migration_20261018_062000_contact_settings.down,
    name: '20261018_062000_contact_settings',
  },
  {
    up: migration_20261018_063000_contact_form_first.up,
    down: migration_20261018_063000_contact_form_first.down,
    name: '20261018_063000_contact_form_first',
  },
];
