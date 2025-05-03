import { IProject } from "testeranto/src/Types";

const config: IProject = {
  projects: {
    justRails: {

      tests: [
        // ["./src/react", "pure", { ports: 0 }, []],
        // ["./src/rails-test.ts", "node", { ports: 0 }, [
        //   // ["./src/rails-launcher.ts", "pure", { ports: 1 }, []]
        //   ["./src/rails-launcher-node.ts", "node", { ports: 1 }, []]
        // ]],
        ["./src/rails-remix.ts", "node", { ports: 0 }, [
          ["./src/rails-remix-launcher.ts", "node", { ports: 2 }, []]
        ]],
      ],

      externalTests: {
        rails: {
          watch: ["src/rails-app/app", "src/rails-app/test"],
          exec: "cd src/rails-app; source ~/.rvm/scripts/rvm && rake"
        }
      },

      ports: ["3001", "3002", "3003", "3004", "3005", "3006", "3007"],
      src: "src",
      debugger: false,
      minify: false,
      clearScreen: false,
      externals: [],
      importPlugins: [],
      nodePlugins: [],
      webPlugins: [],
      
      featureIngestor: async function (s: string): Promise<string> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (res) => {
          try {
            res((await (await fetch(new URL(s).href)).json()).body);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (err) {
            res(s);
          }
        });
      },
      
    },
  },
};
export default config;
