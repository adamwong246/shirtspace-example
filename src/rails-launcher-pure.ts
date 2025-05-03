import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { ITTestResourceConfiguration } from "testeranto/src/lib";

import { Sidecar } from "testeranto/src/lib/Sidecar";

let railsProc: ChildProcessWithoutNullStreams;

class RailsSidecar extends Sidecar{
    
    stop() {
        return railsProc.kill();
    }

    start(t: ITTestResourceConfiguration) {

        railsProc = spawn("source ~/.rvm/scripts/rvm && bin/rails server", [], {
            cwd: "./src/rails-app/",
            shell: "/bin/zsh",
            env: {
                ...process.env,
                "PORT": t.ports[0].toString()
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

}
export default new RailsSidecar();
