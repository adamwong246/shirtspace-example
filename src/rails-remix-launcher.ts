import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { ITTestResourceConfiguration } from "testeranto/src/lib";
import { NodeSidecar } from "testeranto/src/NodeSidecar";

// import { Sidecar } from "testeranto/src/lib/Sidecar";

let railsProc: ChildProcessWithoutNullStreams;
let remixProc: ChildProcessWithoutNullStreams;

class RailsSidecar extends NodeSidecar {
  stop() {
    console.log("STOP")
    railsProc.kill('SIGTERM');
    remixProc.kill('SIGTERM');
    // process.exit()
  }

  start(t: ITTestResourceConfiguration) {
    railsProc = spawn(`source ~/.rvm/scripts/rvm && bin/rails server -P tmp/pids/${t.name.split('/').slice(0, -1)[0]}.pid`, [], {
      cwd: "./src/rails-app/",
      shell: "/bin/zsh",
      env: {
        ...process.env,
        PORT: t.ports[0].toString(),
      },
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

    /////////////////////////////////////////////////

    remixProc = spawn("npx", ["remix-serve", "build/server/index.js"], {
      cwd: "./src/remix-app",
      env: {
        ...process.env,
        PORT: t.ports[1].toString(),
        RAILS_BACKEND:`localhost:${t.ports[0].toString()}`
      },
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
}
export default new RailsSidecar();
