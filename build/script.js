/**
 * WARNING:
 *
 * For the love of god please don't try to run actual commands via this
 * "console".  It's horribly simplified and was simply a nice way to pass the
 * time on an airplane.
 *
 * Also I got pretty lazy with the tab completion stuff - it's gnarly.
 *
 * ALSO ALSO: this probably only works in Chrome.
 */

const reWhitespace = new RegExp("\\s+");

let cmds = [];
let tmpCmd = null;
let historyOffset = null;

let $console = document.getElementById("console");
let currentLine = document.getElementsByClassName("console-line")[1];
let currentBody = currentLine.getElementsByClassName("body")[0];
const consoleLineTemplate = currentLine.cloneNode(true);

window.onkeydown = (ev) => {
    let preventDefault = true;
    switch (ev.key) {
        case "Backspace":
            let content = currentBody.textContent;
            currentBody.textContent = content.slice(0, content.length - 1);
            break;
        case "Tab":
            complete(currentBody.textContent);
            break;
        case "Enter":
            runCmd(currentBody.textContent);
            break;
        case "ArrowUp":
            if (cmds.length > 0) {
                if (historyOffset === null) {
                    tmpCmd = currentBody.textContent;
                    historyOffset = cmds.length;
                }

                historyOffset = Math.max(0, historyOffset - 1);
                if (cmds[historyOffset]) {
                    currentBody.textContent = cmds[historyOffset];
                }
            }
            break;
        case "ArrowDown":
            if ((historyOffset !== null) & (historyOffset < cmds.length)) {
                historyOffset = Math.min(cmds.length, historyOffset + 1);
                if (cmds[historyOffset]) {
                    currentBody.textContent = cmds[historyOffset];
                } else {
                    currentBody.textContent = tmpCmd;
                }
            }
            break;
        default:
            if (ev.key.length === 1 && !ev.ctrlKey && !ev.altKey && !ev.metaKey) {
                currentBody.textContent += ev.key;
            } else {
                preventDefault = false;
            }
    }
    if (preventDefault) {
        ev.preventDefault();
    }
};

const clear = () => {
    currentLine = consoleLineTemplate.cloneNode(true);
    currentBody = currentLine.getElementsByClassName("body")[0];
    $console.append(currentLine);
};

const scrollDown = () => window.scroll(0, document.body.scrollHeight);

const complete = (line) => {
    line = line.trim();

    // parse line
    const parts = line.split(reWhitespace);
    const cmd = parts[0];
    const argv = parts.slice(1);

    const cmdFn = commands[cmd];

    let prefix = "";
    let choices = [];
    if (!cmdFn) {
        // case 1: failed to find a command
        // treat this as a call to help, if no args
        if (argv.length === 0) {
            choices = cmdHelp.complete([cmd]);
        }
    } else if (cmdFn.complete) {
        prefix = cmd + " ";
        // case 2: complete arguments to a command
        choices = commands[cmd].complete(argv);
    }

    if (choices.length === 1) {
        currentBody.textContent = prefix + choices[0];
    } else if (choices.length > 1) {
        // remove cursor from current line
        currentLine.classList.remove("active");

        // save content
        const content = currentBody.textContent;

        // setup stdout
        let stdout = document.createElement("div");
        stdout.classList.add("stdout");
        $console.append(stdout);

        for (let i = 0; i < choices.length; i++) {
            if (i !== 0) {
                stdout.innerHTML += "<br />";
            }
            stdout.innerHTML += choices[i];
        }

        // write new prompt
        currentLine = consoleLineTemplate.cloneNode(true);
        currentBody = currentLine.getElementsByClassName("body")[0];
        currentBody.textContent = content;
        $console.append(currentLine);
        scrollDown();
    }
};

const runCmd = (line, silent) => {
    // reset history pointers
    tmpCmd = historyOffset = null;

    // remove cursor from current line
    currentLine.classList.remove("active");

    line = line.trim();
    if (line !== "") {
        // record history if not a dup
        if (!silent && line !== cmds[cmds.length - 1]) {
            cmds.push(line);
        }

        // setup stdout
        let stdout = document.createElement("div");
        stdout.classList.add("stdout");
        $console.append(stdout);

        const print = (s) => {
            stdout.innerHTML += s;
            scrollDown();
        };

        // parse line
        const parts = line.split(reWhitespace);
        const cmd = parts[0];
        const argv = parts.slice(1);

        //  // run command
        //  if (commands.hasOwnProperty(cmd)) {
        //    commands[cmd](argv, print);
        //  } else {
        //    print("command not found: " + cmd);
        //  }

        // alert(line);

        window.addEventListener('pg_wasm_result', (e) => {
            // alert(e.detail.result);
            print(e.detail.result);
            // resolve(e.detail.query);
        }, {once: true});

        var event = new CustomEvent("pg_wasm_query", {
            detail: {
                query: line
            }
        });
        window.dispatchEvent(event);

    }

    // write new prompt
    currentLine = consoleLineTemplate.cloneNode(true);
    currentBody = currentLine.getElementsByClassName("body")[0];
    $console.append(currentLine);
    scrollDown();
};

const cmdHelp = (_, print) => {
    const cmds = Object.keys(commands);
    for (let i = 0; i < cmds.length; i++) {
        if (i > 0) {
            print("<br />");
        }
        print(cmds[i] + ": " + commands[cmds[i]].help);
    }
};

cmdHelp.help = "this command";

cmdHelp.complete = (argv) => {
    const cmds = Object.keys(commands);
    const choices = [];
    for (let i = 0; i < cmds.length; i++) {
        if (cmds[i].indexOf(argv[0] || "") === 0) {
            choices.push(cmds[i]);
        }
    }
    return choices;
};

const cmdLs = (argv, print) => {
    for (let i = 0; i < files.length; i++) {
        if (argv.length === 0 || argv[0] === files[i].name) {
            if (i > 0) {
                print(" ");
            }
            print(files[i].name);
        }
    }
};

cmdLs.help = "list files";

const cmdCat = (argv, print) => {
    for (let i = 0; i < files.length; i++) {
        if (files[i].name === argv[0]) {
            print(files[i].content);
            return;
        }
    }
    print(argv[0] + ": no such file");
};

cmdCat.help = "read a file";

cmdCat.complete = (argv) => {
    const choices = [];
    for (let i = 0; i < files.length; i++) {
        if (files[i].name.indexOf(argv[0] || "") === 0) {
            choices.push(files[i].name);
        }
    }
    return choices;
};

const cmdClear = () => {
    $console.replaceChildren();
};

cmdClear.help = "clear the screen";

const commands = {
    help: cmdHelp,
    ls: cmdLs,
    cat: cmdCat,
    clear: cmdClear,
};

const files = [
    {
        name: "jobs.txt",
        content: `
 <p>We're currently looking for:</p>
 <ul>
   <li>Systems Software Engineer - distributed storage engine (Rust) and Postgres extension</li>
   <li>Backend/Web Engineer - web console, serverless API</li>
   <li>Infrastructure Engineer - cloud orchestration, database proxy</li>
 </ul>
 <p>To apply, please send a resume and cover letter to <a href="mailto:jobs@zenith.tech">jobs@zenith.tech</a></p>
 `,
    },
    {
        name: "rocket.svg",
        content: ``
    },
];
