import EmPostgres from "./release/postgres.js";
import loadPgData from "./release/pgdata.js";
import loadPgShare from "./release/share.js";

import _pgdata_url from 'pg-wasm/release/pgdata.data';
import _pgshare_url from 'pg-wasm/release/share.data';
import _pgwasm_url from 'pg-wasm/release/postgres.wasm';

class PgWasm {
  static readonly emscripten_opts = {
    preRun: [(root_module) => {
      root_module.FS.mkdir('/pgdata/pg_notify');
      root_module.FS.mkdir('/pgdata/pg_commit_ts');
      root_module.FS.mkdir('/pgdata/pg_replslot');
      root_module.FS.mkdir('/pgdata/pg_twophase');
      root_module.FS.mkdir('/pgdata/pg_tblspc');
    }],
    arguments: ['--single', '-F', '-O', '-j', '-c', 'search_path=pg_catalog',
      '-c', 'dynamic_shared_memory_type=mmap',
      '-c', 'max_prepared_transactions=10',
      '-d', '0', '-D', '/pgdata', 'template1'],
    print: (text) => {
      console.error(text);
    },
    printErr: (text) => {
      console.error(text);
    },
    locateFile: (base, _path) => {
      if (base === 'pgdata.data') {
        return _pgdata_url;
      } else if (base === 'share.data') {
        return _pgshare_url;
      } else if (base === 'postgres.wasm') {
        return _pgwasm_url;
      }
    }
  };

  load() {
    // load FS content
    let em_module = PgWasm.emscripten_opts;
    em_module = loadPgData(em_module);
    em_module = loadPgShare(em_module);

    // load wasm module
    let emp = new (EmPostgres as any)(em_module);
    emp.then(_ => {
      console.log('Postgres bootstrap done.');
    });
  }

  async execute(query: String) {
    return new Promise((resolve, _reject) => {
      window.addEventListener('pg_wasm_result', (e: any) => {
        console.log('got pg_wasm_result: ', e.detail.result);
        resolve(e.detail.result);
      }, { once: true });
      var event = new CustomEvent("pg_wasm_query", {
        detail: {
          query: query
        }
      });
      window.dispatchEvent(event);
      console.log('sent pg_wasm_query');
    });
  }
}

export default PgWasm;