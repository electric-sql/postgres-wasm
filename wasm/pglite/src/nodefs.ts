import * as fs from 'fs';
import * as path from 'path';
import { PostgresliteFsBase, DIRS, FILES, WASM_PGDATA } from './fs.js';
import loadPgShare from "../release/share.js";
import EmPostgres from "../release/postgres.js";

export class PostgresliteFsNode extends PostgresliteFsBase {
  protected rootDir: string;

  constructor(dataDir: string) {
    super(dataDir);
    this.rootDir = path.resolve(dataDir);
  }

  async init() {
    if (!fs.existsSync(this.rootDir)) {
      this.createPgDir();
    }
  }

  createPgDir() {
    console.log("Creating data dir", this.rootDir);
    createDataDir(this.rootDir);

    let emscriptenOpts = {
      preRun: [(root_module: any) => {
        const nodefs = root_module.FS.filesystems.NODEFS;
        root_module.FS.mkdir(WASM_PGDATA);
        root_module.FS.mount(nodefs, { root: this.rootDir }, WASM_PGDATA);
      }],
      arguments: ['--boot', '-x1', '-X', '16777216', '-d', '5', '-c', 'dynamic_shared_memory_type=mmap', '-D', WASM_PGDATA]
    };

    emscriptenOpts = loadPgShare(emscriptenOpts);

    globalThis.__dirname = path.dirname(import.meta.url);
    new EmPostgres(emscriptenOpts).then(() => {
      console.log('Postgres bootstrap done.');
    });
  }

  emscriptenOpts(opts: any): any {
    return opts;
  }
}

export function createDataDir(dataDir: string) {
  const rootDir = path.resolve(dataDir);
  if (!fs.existsSync(rootDir)) {
    fs.mkdirSync(rootDir, { recursive: true });
  }
  fs.chmodSync(dataDir, '0750');
  for (const dir of DIRS) {
    const dirPath = path.join(rootDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      fs.chmodSync(dirPath, '0700');
    }
  }
  for (const file of FILES) {
    const filePath = path.join(rootDir, file);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "");
    }
  }
  fs.writeFileSync(path.join(dataDir, 'PG_VERSION'), '15devel');
  fs.writeFileSync(path.join(dataDir, 'base', '1', 'PG_VERSION'), '15devel');
}
