# postgres@wasm


## Compilation

Prerequisites:
* emscripten/3.1.0
* nodejs


To build postgres.wasm and datadir bundle:
```
make -f wasm/Makefile debug-build
make -f wasm/Makefile debug-datadir
```

You can check it in the browser. Due to modern browsers security policy wasm file can't be loaded with a 'file://' link, so you need to have an http server on the localhost, e.g.:
```
cd wasm
python3 -m http.server
```

Now navigate to `http://localhost:8000/`


## TODO

- [x] separate fs packaging from compiling
- [x] read from events
- [x] somehow report back results
- [x] identify and fix FUNCTION_POINTER_CASTS
- [x] identify and fix corrupt memory error

- [x] automate datadir process
* split to commits, ensure usual postgres is properly built
* provide js wrapper
* nice UI
* catch errors

* less data in share
* exclude wal from the datadir (kk hack) or smaller WAL?

* create postgres db -- more init

* regress test? =)

* "runnable" sql embeds

* work with the remote data
