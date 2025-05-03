import { createRequire } from 'module';const require = createRequire(import.meta.url);
import {
  NodeSidecar
} from "../chunk-WF7QPI43.mjs";

// src/rails-launcher-node.ts
import { spawn } from "child_process";
var railsProc;
var RailsSidecar = class extends NodeSidecar {
  stop() {
    return railsProc.kill();
  }
  start(t) {
    railsProc = spawn(`source ~/.rvm/scripts/rvm && bin/rails server -P tmp/pids/${t.name.split("/").slice(0, -1)[0].split(".")[0]}.pid`, [], {
      cwd: "./src/rails-app/",
      shell: "/bin/zsh",
      env: {
        ...process.env,
        PORT: t.ports[0].toString()
      }
    });
    railsProc.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });
    railsProc.stderr.on("data", (data) => {
      console.log(`stderr: ${data}`);
    });
    railsProc.on("error", (error) => {
      console.log(`error: ${error.message}`);
    });
    railsProc.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
    });
  }
};
var rails_launcher_node_default = new RailsSidecar();
export {
  rails_launcher_node_default as default
};
