import * as migration_20261014_182700_initial from './20261014_182700_initial';

export const migrations = [
  {
    up: migration_20261014_182700_initial.up,
    down: migration_20261014_182700_initial.down,
    name: '20261014_182700_initial'
  },
];
