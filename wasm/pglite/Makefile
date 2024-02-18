.PHONY: debug-build debug-datadir build datadir

build:
	EMCC_CFLAGS="-Wl,--allow-undefined" \
	emconfigure ./configure CFLAGS='-Oz' \
		--without-readline \
		--without-zlib \
		--disable-thread-safety \
		--disable-spinlocks \
		--with-system-tzdata=/usr/share/zoneinfo
	EMCC_CFLAGS="-s ERROR_ON_UNDEFINED_SYMBOLS=0 -s WARN_ON_UNDEFINED_SYMBOLS=0 -s TOTAL_MEMORY=65536000 -s EMULATE_FUNCTION_POINTER_CASTS=1 -s MODULARIZE=1 -s EXPORT_ES6=1 -s EXPORTED_RUNTIME_METHODS='FS'" \
		emmake make -C src/backend MAKELEVEL=0
	mkdir -p wasm/pglite/release
	cp src/backend/postgres wasm/pglite/release/postgres.js
	cp src/backend/postgres.wasm wasm/pglite/release/postgres.wasm
	cd wasm/pglite/ && node scripts/modify-postrges-js.js

sharedir:
	mkdir -p tmp_install
	DESTDIR="$(abspath tmp_install)" \
	EMCC_CFLAGS="-s ERROR_ON_UNDEFINED_SYMBOLS=0 -s WARN_ON_UNDEFINED_SYMBOLS=0 -s TOTAL_MEMORY=65536000 -s EMULATE_FUNCTION_POINTER_CASTS=1 -s MODULARIZE=1 -s EXPORT_ES6=1 -s EXPORTED_RUNTIME_METHODS='FS'" \
		emmake make MAKELEVEL=0 -C src/backend/ install
	node wasm/pglite/scripts/modify-share.js
	cd wasm/pglite/release && \
	`em-config EMSCRIPTEN_ROOT`/tools/file_packager share.data --preload ../../../tmp_install/usr/local/pgsql/share@/usr/local/pgsql/share --js-output=share.js --export-name=ModuleBase
	cd wasm/pglite/ && node scripts/modify-share-js.js
