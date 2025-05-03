import { createRequire } from 'module';const require = createRequire(import.meta.url);

// src/rails-remix-launcher.ts
import { spawn } from "child_process";

// ../testeranto/src/lib/Sidecar.ts
var Sidecar = class {
};

// ../testeranto/src/PM/nodeSidecar.ts
import net from "net";

// ../testeranto/src/PM/sidecar.ts
var PM_sidecar = class {
  // abstract stop(): Promise<void>;
  // abstract testArtiFactoryfileWriter(tLog: ITLog, callback: (Promise) => void);
  // abstract $(selector: string): any;
  // abstract click(selector: string): any;
  // abstract closePage(p): any;
  // abstract createWriteStream(
  //   filepath: string,
  //   testName: string
  // ): Promise<string>;
  // abstract customclose();
  // abstract customScreenShot(opts: object, page?: string): any;
  // abstract end(uid: number): Promise<boolean>;
  // abstract existsSync(fp: string): Promise<boolean>;
  // abstract focusOn(selector: string): any;
  // abstract getAttribute(selector: string, attribute: string): any;
  // abstract getValue(value: string): any;
  // abstract goto(p, url: string): any;
  // abstract isDisabled(selector: string): Promise<boolean>;
  // abstract mkdirSync(a: string);
  // abstract newPage(): Promise<string>;
  // abstract page(): Promise<string | undefined>;
  // abstract pages(): Promise<string[]>;
  // abstract screencast(o: ScreenRecorderOptions, p: Page | string): any;
  // abstract screencastStop(s: string): any;
  // abstract typeInto(selector: string, value: string): any;
  // abstract waitForSelector(p, sel: string);
  // abstract write(uid: number, contents: string): Promise<boolean>;
  // abstract writeFileSync(f: string, c: string, t: string): Promise<boolean>;
  // abstract launchSideCar(
  //   n: number
  // ): Promise<[number, ITTestResourceConfiguration]>;
  // abstract stopSideCar(n: number): Promise<any>;
};

// ../testeranto/src/PM/nodeSidecar.ts
var PM_Node_Sidecar = class extends PM_sidecar {
  constructor(t) {
    super();
    this.testResourceConfiguration = t;
  }
  start(stopper) {
    return new Promise((res) => {
      process.on("message", async (message) => {
        if (message === "stop") {
          console.log("STOP!", stopper.toString());
          await stopper();
          process.exit();
        } else if (message.path) {
          this.client = net.createConnection(message.path, () => {
            res();
          });
        }
      });
    });
  }
  // stop(): Promise<void> {
  //   throw new Error("Method not implemented.");
  // }
  send(command, ...argz) {
    return new Promise((res) => {
      const key = Math.random().toString();
      const myListener = (event) => {
        const x = JSON.parse(event);
        if (x.key === key) {
          process.removeListener("message", myListener);
          res(x.payload);
        }
      };
      process.addListener("message", myListener);
      this.client.write(JSON.stringify([command, ...argz, key]));
    });
  }
};

// ../testeranto/src/NodeSidecar.ts
var NodeSidecar = class extends Sidecar {
  pm;
  constructor(t) {
    super();
    this.pm = new PM_Node_Sidecar(t);
    this.pm.start(this.stop).then(() => {
      this.start(JSON.parse(process.argv[2]));
    });
  }
  // start(t: ITTestResourceConfiguration) {
  //   throw new Error("Method not implemented.");
  // }
  // stop() {
  //   console.log("NewSideCar stop");
  //   // process.exit();
  //   throw new Error("STOP not implemented.");
  // }
};

// src/rails-remix-launcher.ts
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
