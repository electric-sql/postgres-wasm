import React from "react";
import { createRoot } from 'react-dom/client';

import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { Readline } from "xterm-readline";
import { WebglAddon } from 'xterm-addon-webgl';

import hljs from 'highlight.js/lib/core';
import pgsql from 'highlight.js/lib/languages/pgsql';
hljs.registerLanguage('pgsql', pgsql);

import "xterm/css/xterm.css";
import "./app.css";
import { Highlighter } from "xterm-readline/lib/highlight";


import PgWasm from 'pg-wasm';



// console.log(_pgwasm_url)

let term : Terminal;


export default class App extends React.Component {

  componentDidMount() {
    term = new Terminal({
      fontFamily: `'Fira Mono', monospace`,
      fontSize: 15,
      fontWeight: 900,
      cursorBlink: true,
      cursorStyle: "block",
      lineHeight: 1.2,
    });

    // Styling: https://github.com/sonph/onehalf/tree/master/windowsterminal
    term.options.theme = {
      "background" : "#282C34",
      "black" : "#282C34",
      "blue" : "#61AFEF",
      "brightBlack" : "#282C34",
      "brightBlue" : "#61AFEF",
      "brightCyan" : "#56B6C2",
      "brightGreen" : "#98C379",
      "brightRed" : "#E06C75",
      "brightWhite" : "#DCDFE4",
      "brightYellow" : "#E5C07B",
      "cyan" : "#56B6C2",
      "foreground" : "#DCDFE4",
      "green" : "#98C379",
      "red" : "#E06C75",
      "white" : "#DCDFE4",
      "yellow" : "#E5C07B"
    }


    // Load Fit Addon
    let fitAddon = new FitAddon();
    term.loadAddon(fitAddon);


    term.write("Welcome to pg-wasm!\n\n");
    // Load Readline
    const rl = new Readline();
    term.loadAddon(rl);


    // hljs.addPlugin({
    //   'after:highlightElement': ({ el, result, text }) => {
    //     // move the language from the result into the dataset
    //     // el.dataset.language = result.language;
    //     console.log(el)
    //     console.log(result)
    //     console.log(text)
    //   },
    //   'after:highlight': (result ) => {
    //     // move the language from the result into the dataset
    //     // el.dataset.language = result.language;

    //     console.log(result)

    //   }
    // });

    // class PgWasmHihghlight implements Highlighter {
    //   highlight(line: string, pos: number): string {
    //     return hljs.highlight('pgsql', line).value;
    //   };
    //   highlightPrompt(prompt: string): string {
    //     return prompt;
    //   };
    //   highlightChar(line: string, pos: number): boolean {
    //     return true;
    //   };
    // }

    // rl.setHighlighter(new PgWasmHihghlight());

    rl.setCheckHandler((text) => {
      let trimmedText = text.trimEnd();
      if (trimmedText.endsWith("&&")) {
        return false;
      }
      return true;
    });
    
    function readLine() {
      rl.read("\x1b[1;34mpg-wasm>\x1b[37m ")
        .then(processLine);
    }

    let pg_wasm = new PgWasm();
    pg_wasm.load();
    
    async function processLine(text: String) {
      rl.println(await pg_wasm.execute(text) as string);
      setTimeout(readLine);
    }
    
    readLine();

    

    // Start Terminal
    term.open(document.getElementById("xterm")!);

    // Load WebGL Addon
    term.loadAddon(new WebglAddon());

    fitAddon.fit();

    
    term.focus();
  }

  render() {
    return (
      <div className="App" style={{ height: "100%", width: "100%" }}>
        <div id="xterm" style={{ height: "100%", width: "100%" }}/>
      </div>
    );
  }
}

createRoot(document.getElementById('root')!).render(<App/>);
