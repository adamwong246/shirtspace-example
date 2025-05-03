import { createRequire } from 'module';const require = createRequire(import.meta.url);
import {
  NodeSidecar
} from "../chunk-WF7QPI43.mjs";

// src/rails-remix-launcher.ts
import { spawn } from "child_process";
var railsProc;
var remixProc;
var RailsSidecar = class extends NodeSidecar {
  stop() {
    console.log("STOP");
    railsProc.kill("SIGTERM");
    remixProc.kill("SIGTERM");
  }
  start(t) {
    railsProc = spawn(`source ~/.rvm/scripts/rvm && bin/rails server -P tmp/pids/${t.name.split("/").slice(0, -1)[0]}.pid`, [], {
      cwd: "./src/rails-app/",
      shell: "/bin/zsh",
      env: {
        ...process.env,
        PORT: t.ports[0].toString()
      }
    });
    railsProc.stdout.on("data", (data) => {
      console.log(`rails stdout: ${data}`);
    });
    railsProc.stderr.on("data", (data) => {
      console.log(`rails stderr: ${data}`);
    });
    railsProc.on("error", (error) => {
      console.log(`rails error: ${error.message}`);
    });
    railsProc.on("close", (code) => {
      console.log(`rails exited with code ${code}`);
    });
    remixProc = spawn("npx", ["remix-serve", "build/server/index.js"], {
      cwd: "./src/remix-app",
      env: {
        ...process.env,
        PORT: t.ports[1].toString(),
        RAILS_BACKEND: `localhost:${t.ports[0].toString()}`
      }
    });
    remixProc.stdout.on("data", (data) => {
      console.log(`remix stdout: ${data}`);
    });
    remixProc.stderr.on("data", (data) => {
      console.log(`remix stderr: ${data}`);
    });
    remixProc.on("error", (error) => {
      console.log(`remix error: ${error.message}`);
    });
    remixProc.on("close", (code) => {
      console.log(`remix exited with code ${code}`);
    });
  }
};
var rails_remix_launcher_default = new RailsSidecar();
export {
  rails_remix_launcher_default as default
};
