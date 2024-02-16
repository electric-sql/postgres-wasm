export const DIRS = [
  'global',
  'pg_wal',
  'pg_wal/archive_status',
  'pg_commit_ts',
  'pg_dynshmem',
  'pg_notify',
  'pg_serial',
  'pg_snapshots',
  'pg_subtrans',
  'pg_twophase',
  'pg_multixact',
  'pg_multixact/members',
  'pg_multixact/offsets',
  'base',
  'base/1',
  'pg_replslot',
  'pg_tblspc',
  'pg_stat',
  'pg_stat_tmp',
  'pg_xact',
  'pg_logical',
  'pg_logical/snapshots',
  'pg_logical/mapping',
]


export const FILES = [
  'postgresql.conf',
  'postgresql.auto.conf',
  'pg_ident.conf',
  'pg_hba.conf',
]

export const WASM_PGDATA = '/pgdata'

export interface PostgresliteFs {
  new (dataDir: string): PostgresliteFsInstance;
}

export interface PostgresliteFsInstance {
  init(): Promise<void>;
  emscriptenOpts(opts: any): any;
}

export abstract class PostgresliteFsBase implements PostgresliteFsInstance {
  protected dataDir?: string;
  constructor(dataDir?: string) {
    this.dataDir = dataDir;
  }
  abstract init(): Promise<void>;
  abstract emscriptenOpts(opts: any): any;
}
