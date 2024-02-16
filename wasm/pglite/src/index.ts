import EmPostgres from "../release/postgres.js";
import type { PostgresliteFsInstance } from "./fs.js";
import { PostgresliteFsNode } from "./nodefs.js";
import { PostgresliteMem } from "./memfs.js";
import path from "path";
import { createRequire } from "module";

export class PGlite {
  readonly dataDir?: string;
  protected fs?: PostgresliteFsInstance;
  protected emp?: any;

  #initStarted = false;
  #ready = false;
  #eventTarget: EventTarget;
  #closed = false;

  #awaitingResult = false;
  #resultError?: string;

  waitReady: Promise<void>;

  constructor(dataDir?: string) {
    this.dataDir = dataDir;
    this.#eventTarget = new EventTarget();
    this.waitReady = this.#init();
  }

  #init() {
    return new Promise<void>(async (resolve, reject) => {
      if (this.#initStarted) {
        throw new Error("Already initializing");
      }
      this.#initStarted = true;

      if (this.dataDir) {
        this.fs = new PostgresliteFsNode(this.dataDir);
      } else {
        this.fs = new PostgresliteMem();
      }

      const chosenFs = this.dataDir ? PostgresliteFsNode : PostgresliteMem;
      this.fs = new chosenFs(this.dataDir);
      await this.fs.init();

      let emscriptenOpts = {
        // prettier-ignore
        arguments: [
          '--single', '-F', '-O', '-j', '-c', 'search_path=pg_catalog',
          '-c', 'dynamic_shared_memory_type=mmap',
          '-c', 'max_prepared_transactions=10',
          '-d', '0', '-D', '/pgdata', 'template1'],
        print: (text: string) => {
          // console.error(text);
        },
        printErr: (text: string) => {
          if (
            this.#awaitingResult &&
            !this.#resultError &&
            text.includes("ERROR:")
          ) {
            this.#resultError = text.split("ERROR:")[1].trim();
          }
          // console.error(text);
        },
        onRuntimeInitialized: () => {
          this.#ready = true;
          resolve();
        },
        eventTarget: this.#eventTarget,
        Event: CustomEvent,
        onExit: () => {
          this.#closed = true;
          // console.log("Postgreslite closed");
        },
      };

      emscriptenOpts = this.fs.emscriptenOpts(emscriptenOpts);

      globalThis.__dirname = path.dirname(import.meta.url);
      globalThis.require = createRequire(import.meta.url);

      const emp = new EmPostgres(emscriptenOpts);
      this.emp = emp;
    });
  }

  get ready() {
    return this.#ready;
  }

  get closed() {
    return this.#closed;
  }

  async close() {
    // TODO
  }

  async query(query: String) {
    /**
     * TODO:
     * - Support for parameterized queries
     */
    if (this.#closed) {
      throw new Error("Postgreslite is closed");
    }
    if (!this.#ready) {
      await this.waitReady;
    }
    this.#awaitingResult = true;
    return new Promise((resolve, reject) => {
      const handleWaiting = () => {
        this.#eventTarget.removeEventListener("result", handleResult);
        if (this.#resultError) {
          reject(new Error(this.#resultError));
        } else {
          resolve(undefined);
        }
        this.#resultError = undefined;
      };

      const handleResult = (e: any) => {
        this.#eventTarget.removeEventListener("waiting", handleWaiting);
        resolve(e.detail.result);
        this.#resultError = undefined;
      };

      this.#eventTarget.addEventListener("waiting", handleWaiting, {
        once: true,
      });
      this.#eventTarget.addEventListener("result", handleResult, {
        once: true,
      });

      const event = new CustomEvent("query", {
        detail: {
          query: query,
        },
      });

      this.#eventTarget.dispatchEvent(event);
    });
  }
}
