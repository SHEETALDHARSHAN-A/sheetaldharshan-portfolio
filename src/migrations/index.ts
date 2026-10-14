import * as migration_20261014_182700_initial from './20261014_182700_initial';
import * as migration_20261015_000000_enable_rls from './20261015_000000_enable_rls';

export const migrations = [
  {
    up: migration_20261014_182700_initial.up,
    down: migration_20261014_182700_initial.down,
    name: '20261014_182700_initial'
  },
  {
    up: migration_20261015_000000_enable_rls.up,
    down: migration_20261015_000000_enable_rls.down,
    name: '20261015_000000_enable_rls',
  },
];
