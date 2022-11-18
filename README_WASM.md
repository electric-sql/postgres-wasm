# pg-wasm


## Compilation

Prerequisites:
* emscripten/3.1.0
* nodejs
* postgres build toolchain


To build postgres.wasm and datadir bundle:
```
make -f wasm/pg-wasm/Makefile build
make -f wasm/pg-wasm/Makefile datadir
```

You can check it in the browser locally:
```
cd wasm/pg-wasm-app
yarn run start
```

Now navigate to `http://localhost:8000/`


## TODO

- [x] separate fs packaging from compiling
- [x] read from events
- [x] somehow report back results
- [x] identify and fix FUNCTION_POINTER_CASTS
- [x] identify and fix corrupt memory error
- [x] automate datadir creation process
- [x] provide js wrapper
- [x] xterm.js + readline UI

* catch errors
* split to commits, ensure usual postgres is properly built
* less data in share
* exclude wal from the datadir (kk hack)
* inspet where rest of the data went
* smaller binary (?)

* try to deploy in worker or other cloud wasm runtime (and benchmark?)

* regress test? =)

* "runnable" sql embeds

* work with the remote data


function load(Module) {

<...>


  return Module;
}

export default load;