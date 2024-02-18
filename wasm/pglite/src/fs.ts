export const PGDATA = "/pgdata";

export interface FilesystemFactory {
  new (dataDir: string): Filesystem;
}

export interface Filesystem {
  init(): Promise<void>;
  emscriptenOpts(opts: any): Promise<any>;
}

export abstract class FilesystemBase implements Filesystem {
  protected dataDir?: string;
  constructor(dataDir?: string) {
    this.dataDir = dataDir;
  }
  abstract init(): Promise<void>;
  abstract emscriptenOpts(opts: any): Promise<any>;
}
