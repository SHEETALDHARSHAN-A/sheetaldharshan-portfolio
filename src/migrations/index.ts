import * as migration_20261014_182700_initial from './20261014_182700_initial';
import * as migration_20261015_000000_enable_rls from './20261015_000000_enable_rls';
import * as migration_20261017_163947_coding_activity from './20261017_163947_coding_activity';
import * as migration_20261017_180257_pet_and_brand from './20261017_180257_pet_and_brand';
import * as migration_20261017_190000_coding_activity_placement from './20261017_190000_coding_activity_placement';
import * as migration_20261017_200000_coding_activity_open from './20261017_200000_coding_activity_open';

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
    up: migration_20261017_180257_pet_and_brand.up,
    down: migration_20261017_180257_pet_and_brand.down,
    name: '20261017_180257_pet_and_brand',
  },
  {
    up: migration_20261017_190000_coding_activity_placement.up,
    down: migration_20261017_190000_coding_activity_placement.down,
    name: '20261017_190000_coding_activity_placement',
  },
  {
    up: migration_20261017_200000_coding_activity_open.up,
    down: migration_20261017_200000_coding_activity_open.down,
    name: '20261017_200000_coding_activity_open'
  },
];
