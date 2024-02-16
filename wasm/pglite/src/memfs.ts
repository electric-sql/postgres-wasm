import { PostgresliteFsBase } from './fs.js';
import loadPgData from "../release/pgdata.js";
import loadPgShare from "../release/share.js";

const PGWASM_URL = new URL("../release/postgres.wasm", import.meta.url);
const PGDATA_URL = new URL("../release/pgdata.data", import.meta.url);
const PGSHARE_URL = new URL("../release/share.data", import.meta.url);

export class PostgresliteMem extends PostgresliteFsBase {
  async init() {
    
  }

  emscriptenOpts(opts: any): any {
    const options = {
      ...opts,  
      preRun: [(root_module: any) => {
        root_module.FS.mkdir('/pgdata/pg_notify');
        root_module.FS.mkdir('/pgdata/pg_commit_ts');
        root_module.FS.mkdir('/pgdata/pg_replslot');
        root_module.FS.mkdir('/pgdata/pg_twophase');
        root_module.FS.mkdir('/pgdata/pg_tblspc');
      }],
      locateFile: (base: string, _path: any) => {
        let path;
        if (base === 'pgdata.data') {
          path = PGDATA_URL.toString();
        } else if (base === 'share.data') {
          path = PGSHARE_URL.toString();
        } else if (base === 'postgres.wasm') {
          path = PGWASM_URL.toString();
        }
        if (path?.startsWith('file://')) {
          path = path.slice(7);
        }
        return path;
      }
    }
    loadPgData(options);
    loadPgShare(options);
    return options;
  }
}