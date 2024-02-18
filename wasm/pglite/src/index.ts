import EmPostgresFactory, { type EmPostgres } from "../release/postgres.js";
import type { Filesystem } from "./fs.js";
import { NodeFS } from "./nodefs.js";
import { MemoryFS } from "./memoryfs.js";
import { nodeValues } from "./utils.js";

export class PGlite {
  readonly dataDir?: string;
  protected fs?: Filesystem;
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

  async #init() {
    return new Promise<void>(async (resolve, reject) => {
      if (this.#initStarted) {
        throw new Error("Already initializing");
      }
      this.#initStarted = true;

      this.fs = this.dataDir ? new NodeFS(this.dataDir) : new MemoryFS();
      await this.fs.init();

      let emscriptenOpts: Partial<EmPostgres> = {
        arguments: [
          "--single", // Single user mode
          "-F", // Disable fsync (TODO: Only for in-memory mode?)
          "-O", // Allow the structure of system tables to be modified. This is used by initdb
          "-j", // Single use mode - Use semicolon followed by two newlines, rather than just newline, as the command entry terminator.
          "-c", // Set parameter
          "search_path=pg_catalog",
          "-c",
          "dynamic_shared_memory_type=mmap",
          "-c",
          "max_prepared_transactions=10",
          "-d", // Debug level
          "5",
          "-D", // Data directory
          "/pgdata",
          "template1",
        ],
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
      };

      const { dirname, require } = await nodeValues();
      emscriptenOpts = await this.fs.emscriptenOpts(emscriptenOpts);
      const emp = await EmPostgresFactory(emscriptenOpts, dirname, require);
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
     * - Mutex to prevent multiple queries at the same time
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
