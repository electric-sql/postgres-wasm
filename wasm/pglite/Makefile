.PHONY: debug-build debug-datadir build datadir

# debug-build:
# 	EMCC_CFLAGS="-Wl,--allow-undefined" \
# 	emconfigure ./configure CFLAGS='-Oz' \
# 		--without-readline \
# 		--without-zlib \
# 		--disable-thread-safety \
# 		--disable-spinlocks \
# 		--with-system-tzdata=/usr/share/zoneinfo \
# 		--enable-debug
# 	EMCC_CFLAGS="-s ERROR_ON_UNDEFINED_SYMBOLS=0 -s WARN_ON_UNDEFINED_SYMBOLS=0 -s TOTAL_MEMORY=65536000 -s EMULATE_FUNCTION_POINTER_CASTS=1 -s ASSERTIONS=1" \
# 		emmake make -C src/backend MAKELEVEL=0
# 	mkdir -p wasm/debug
# 	cp src/backend/postgres wasm/debug/postgres.js
# 	cp src/backend/postgres.wasm wasm/debug/postgres.wasm

# debug-datadir:
# 	mkdir -p tmp_install
# 	DESTDIR="$(abspath tmp_install)" \
# 	EMCC_CFLAGS="-s ERROR_ON_UNDEFINED_SYMBOLS=0 -s WARN_ON_UNDEFINED_SYMBOLS=0 -s TOTAL_MEMORY=65536000 -s EMULATE_FUNCTION_POINTER_CASTS=1 -s ASSERTIONS=1" \
# 		emmake make MAKELEVEL=0 -C src/backend/ install
# 	node wasm/initdb.js
# 	cd wasm/debug && \
# 	`em-config EMSCRIPTEN_ROOT`/tools/file_packager pgdata.data --preload ./temp_pgdata@/pgdata --js-output=pgdata.js && \
# 	`em-config EMSCRIPTEN_ROOT`/tools/file_packager share.data --preload ../../tmp_install/usr/local/pgsql/share@/usr/local/pgsql/share --js-output=share.js

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
	mkdir -p wasm/postgreslite/release
	cp src/backend/postgres wasm/postgreslite/release/postgres.js
	cp src/backend/postgres.wasm wasm/postgreslite/release/postgres.wasm

datadir:
	mkdir -p tmp_install
	DESTDIR="$(abspath tmp_install)" \
	EMCC_CFLAGS="-s ERROR_ON_UNDEFINED_SYMBOLS=0 -s WARN_ON_UNDEFINED_SYMBOLS=0 -s TOTAL_MEMORY=65536000 -s EMULATE_FUNCTION_POINTER_CASTS=1 -s MODULARIZE=1 -s EXPORT_ES6=1 -s EXPORTED_RUNTIME_METHODS='FS'" \
		emmake make MAKELEVEL=0 -C src/backend/ install
	PGWASM_BUILD_TYPE=release node wasm/postgreslite/initdb.js
	cd wasm/postgreslite/release && \
	`em-config EMSCRIPTEN_ROOT`/tools/file_packager pgdata.data --preload ./temp_pgdata@/pgdata --js-output=pgdata.js --export-name=ModuleBase && \
	`em-config EMSCRIPTEN_ROOT`/tools/file_packager share.data --preload ../../../tmp_install/usr/local/pgsql/share@/usr/local/pgsql/share --js-output=share.js --export-name=ModuleBase

	cd wasm/postgreslite/release && \
	sed -i.old '1s;^;import { createRequire } from "module"\;\nconst require = createRequire(import.meta.url)\;\nvar Module = (ModuleBase) => {\n;' pgdata.js && \
	printf "\nreturn Module;\n};" >> pgdata.js && \
	printf "\nexport default Module;" >> pgdata.js && \
	rm pgdata.js.old

	cd wasm/postgreslite/release && \
	sed -i.old '1s;^;import { createRequire } from "module"\;\nconst require = createRequire(import.meta.url)\;\nvar Module = (ModuleBase) => {\n;' share.js && \
	printf "\nreturn Module;\n};" >> share.js && \
	printf "\nexport default Module;" >> share.js && \
	rm share.js.old
