# postgres@wasm


## Compilation

export EMMAKEN_CFLAGS="-Wl,--allow-undefined"
emconfigure ./configure CFLAGS='-Oz' --without-readline --without-zlib --disable-thread-safety --disable-spinlocks
export EMMAKEN_CFLAGS="-s ERROR_ON_UNDEFINED_SYMBOLS=0 -s TOTAL_MEMORY=65536000 -s EMULATE_FUNCTION_POINTER_CASTS=1"
emmake make -j4

## Setup the data directory

emcc src/bin/initdb/initdb.o -L src/port/ -L src/common -L src/fe_utils -L src/interfaces/libpq -lpq -lpgfeutils -lpgcommon -lpgport -o initdb.js

# create empty datadir
rm -rf datadir
mkdir datadir
chmod 0750 datadir
touch datadir/postgresql.conf
touch datadir/postgresql.auto.conf
touch datadir/pg_ident.conf
touch datadir/pg_hba.conf
echo '15devel' > datadir/PG_VERSION
mkdir -p datadir/global
mkdir -p datadir/pg_wal/archive_status
mkdir -p datadir/pg_commit_ts
mkdir -p datadir/pg_dynshmem
mkdir -p datadir/pg_notify
mkdir -p datadir/pg_serial
mkdir -p datadir/pg_snapshots
mkdir -p datadir/pg_subtrans
mkdir -p datadir/pg_twophase
mkdir -p datadir/pg_multixact
mkdir -p datadir/pg_multixact/members
mkdir -p datadir/pg_multixact/offsets
mkdir -p datadir/base
mkdir -p datadir/base/1
echo '15devel' > datadir/base/1/PG_VERSION
mkdir -p datadir/pg_replslot
mkdir -p datadir/pg_tblspc
mkdir -p datadir/pg_stat
mkdir -p datadir/pg_stat_tmp
mkdir -p datadir/pg_xact
mkdir -p datadir/pg_logical
mkdir -p datadir/pg_logical/snapshots
mkdir -p datadir/pg_logical/mapping


# add that keys to postgres.o compilation:
--preload-file /Users/stas/datadir --preload-file /usr/local/pgsql/share/

cd src/backend

node postgres --boot -x1 -X 16777216 -d 5 -c dynamic_shared_memory_type=mmap -D /data



node postgres --single -F -O -j -c search_path=pg_catalog -c dynamic_shared_memory_type=mmap -d 5 -D /data template1




------


var Module = {
  preRun: [function() {
    function stdin() {
      // Return ASCII code of character, or null if no input
    }

    function stdout(asciiCode) {
      // Do something with the asciiCode
    }

    function stderr(asciiCode) {
      // Do something with the asciiCode
    }

    FS.init(stdin, stdout, stderr);
  }]
};


# todo

+ separate fs packaging from compiling
+ read from events
+ somehow report back
+ identify and fix FUNCTION_POINTER_CASTS
+ fix report back corrupt memory

* automate datadir process
* split to commits, ensure usual postgres is properly built
* provide js wrapper
* nice UI
* catch errors

* less data in share
* exclude wal from the datadir (kk hack) or smaller WAL?

* create postgres db -- more init

* regress test? =)

* work with the remote data
