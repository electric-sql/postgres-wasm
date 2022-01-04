#!/usr/bin/env node
// 
// This script generates file packs needed for postgres to start:
//
// * Properly initialized data directory. We use NODEFS driver to share the
//   data directory between the host system and wasm. That way initialization
//   mostly happens inside of the wasm. Some preliminary steps like creating
//   directory strycture and filling BKI file template are done in that script.
//
// * /usr/local/pgsql/share/ directory. Postgres needs it at least for the
//   timezone. Probably with a bit of work we could get rid of it.
//
var fs = require('fs');
var path = require('path');

DIRS = [
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


FILES = [
  'postgresql.conf',
  'postgresql.auto.conf',
  'pg_ident.conf',
  'pg_hba.conf',
]

WASM_PGDATA = '/pgdata'

// Wasm has it's own 32-bit architecture, so wee need to initialize the data directory
// from the wasm itself. Use NODEFS shared directories to do this.
function initDataDir(build_path, share_path) {

  let datadir_path = build_path + '/temp_pgdata'

  // 1. Create postgres datadir structure
  console.log('Creating postgres datadir structure in :', datadir_path)
  fs.rmSync(datadir_path, {recursive: true, force: true});
  fs.mkdirSync(datadir_path);
  fs.chmodSync(datadir_path, '0750');
  for (dir of DIRS) {
    console.log('Creating directory: ' + datadir_path + '/' + dir);
    fs.mkdirSync(datadir_path + '/' + dir);
    fs.chmodSync(datadir_path + '/' + dir, '0700');
  }
  for (file of FILES) {
    fs.writeFileSync(datadir_path + '/' + file, '');
  }
  fs.writeFileSync(datadir_path + '/PG_VERSION', '15devel');
  fs.writeFileSync(datadir_path + '/base/1/PG_VERSION', '15devel');

  // 2. Fill BKI file template
  let bki = fs.readFileSync(share_path + '/postgres.bki', 'utf8')

  bki = bki.replaceAll('NAMEDATALEN', '64')
  bki = bki.replaceAll('SIZEOF_POINTER', '4')
  bki = bki.replaceAll('ALIGNOF_POINTER', 'i')
  bki = bki.replaceAll('FLOAT8PASSBYVAL', 'false')
  bki = bki.replaceAll('POSTGRES', "'postgres'")
  bki = bki.replaceAll('ENCODING', '6') // PG_UTF8
  bki = bki.replaceAll('LC_COLLATE', "'en_US.UTF-8'")
  bki = bki.replaceAll('LC_CTYPE', "'en_US.UTF-8'")

  fs.writeFileSync(share_path + '/postgres_wasm.bki', bki);

  // 3. Bootstrap postgres
  var Module = {
    preRun: () => {
        FS.mkdir(WASM_PGDATA);
        FS.mount(NODEFS, { root: datadir_path }, WASM_PGDATA);
  
        FS.mkdir('/usr');
        FS.mkdir('/usr/local');
        FS.mkdir('/usr/local/pgsql');
        FS.mkdir('/usr/local/pgsql/share');
        FS.mount(NODEFS, { root: share_path }, '/usr/local/pgsql/share');
    },
    locateFile: (file_path, _dir) => {
      let p = path.resolve(build_path, file_path);
      console.log('Locate file:', file_path, '->', p);
      return p;
    },
    arguments: ['--boot', '-x1', '-X', '16777216', '-d', '5', '-c', 'dynamic_shared_memory_type=mmap', '-D', WASM_PGDATA]
  };
  eval(fs.readFileSync(path.resolve(build_path,'postgres.js')).toString());

}

// assumming that this script is located in repo_root/wasm
let build_path = path.resolve(__dirname, 'debug');
let share_path = path.resolve(__dirname, '../tmp_install/usr/local/pgsql/share');

initDataDir(build_path, share_path);

