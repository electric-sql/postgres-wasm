import { FilesystemBase, PGDATA } from "./fs.js";
import type { FS, EmPostgres } from "../release/postgres.js";
import loadPgShare from "../release/share.js";
import { initDb } from "./initdb.js";
import { nodeValues } from "./utils.js";

const PGWASM_URL = new URL("../release/postgres.wasm", import.meta.url);
const PGSHARE_URL = new URL("../release/share.data", import.meta.url);

export class MemoryFS extends FilesystemBase {
  initModule?: any;

  async init() {
    this.initModule = await initDb();
  }

  async emscriptenOpts(opts: Partial<EmPostgres>) {
    const options: Partial<EmPostgres> = {
      ...opts,
      preRun: [
        (mod: any) => {
          /**
           * There is an issue with just mounting the filesystem, Postgres stalls...
           * so we need to copy the files from the memory filesystem to the main fs
           */
          const proxyfs = mod.FS.filesystems.PROXYFS;
          mod.FS.mkdir(PGDATA + "_temp");
          mod.FS.mkdir(PGDATA);
          mod.FS.mount(
            proxyfs,
            { root: PGDATA + "/", fs: this.initModule.FS },
            PGDATA + "_temp"
          );
          copyDir(mod.FS, PGDATA + "_temp", PGDATA);
          mod.FS.unmount(PGDATA + "_temp");
        },
      ],
      locateFile: (base: string, _path: any) => {
        let path = "";
        if (base === "share.data") {
          path = PGSHARE_URL.toString();
        } else if (base === "postgres.wasm") {
          path = PGWASM_URL.toString();
        }
        if (path?.startsWith("file://")) {
          path = path.slice(7);
        }
        return path;
      },
    };
    const { require } = await nodeValues();
    loadPgShare(options, require);
    return options;
  }
}

function copyDir(fs: FS, src: string, dest: string) {
  const entries = fs.readdir(src);
  for (const name of entries) {
    if (name === "." || name === "..") continue;

    const srcPath = src + "/" + name;
    const destPath = dest + "/" + name;
    if (isDir(fs, srcPath)) {
      fs.mkdir(destPath);
      copyDir(fs, srcPath, destPath);
    } else {
      const data = fs.readFile(srcPath);
      fs.writeFile(destPath, data);
    }
  }
}

function isDir(fs: FS, path: string) {
  return fs.isDir(fs.stat(path).mode);
}
