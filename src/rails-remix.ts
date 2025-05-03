/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Testeranto from "testeranto/src/Node";
import {
  Ibdd_in,
  Ibdd_out,
  IPartialInterface,
  ITestImplementation,
  ITestSpecification,
} from "testeranto/src/Types";
import { ITTestResourceConfiguration } from "testeranto/src/lib";

import { assert } from "chai";

import { IPM } from "../../testeranto/src/lib/types";

import { PM } from "../../testeranto/src/PM";
import { PM_Web } from "testeranto/src/PM/web";
import { exec, spawn } from "child_process";
import { PM_Node } from "testeranto/src/PM/node";

export type M = {
  givens: {
    [K in keyof O["givens"]]: () => Promise<any>;
  };
  whens: {
    [K in keyof O["whens"]]: (
      ...Iw: O["whens"][K]
    ) => (
      domain: string,
      railsPort: number,
      remixPort: number,
      utils: PM
    ) => any;
  };
  thens: {
    [K in keyof O["thens"]]: (
      ...Iw: O["thens"][K]
    ) => (domain: string, p: number, utils: PM) => any;
  };
};

export const implementation: ITestImplementation<I, O, M> = {
  suites: {
    Default: "an empty rails app",
  },

  givens: {
    EmptyDb: () => new Promise((res, rej) => {
      exec(
        "cd src/rails-app && source ~/.rvm/scripts/rvm && rake db:drop && rake db:create && rake db:schema:load",
        (error, stdout, stderr) => {
          if (error) {
            console.error(`EmptyDb exec error: ${error}`);
            return;
          }
          console.log(`EmptyDb stdout: ${stdout}`);
          console.error(`EmptyDb stderr: ${stderr}`);
          res(true)
        }
      );
    }),
    SeededDb: () => new Promise((res, rej) => {
      exec(
        "cd src/rails-app && source ~/.rvm/scripts/rvm && rake db:drop && rake db:create && rake db:schema:load && rake db:seed",
        (error, stdout, stderr) => {
          if (error) {
            console.error(`EmptyDb exec error: ${error}`);
            return;
          }
          console.log(`EmptyDb stdout: ${stdout}`);
          console.error(`EmptyDb stderr: ${stderr}`);
          res(true)
        }
      );
    })
    
  },

  whens: {
    ATodoIsAdded: (title: string) => {
      return async ([domain, x, railsPort, remixPort], pm) => {
        await fetch(`http://${domain}:${railsPort}/todos`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ title }),
        });

        // we must wait a moment because sqlite3 does not allow concurrent writes
        // await new Promise(resolve => setTimeout(resolve, 1));
      };

    },
  },

  thens: {
    // RailsHas404Page: async (domain, railsPort, remixPort) => {
    //   const backend = `${domain}:${railsPort}`;
    //   const f = await fetch(`http://${backend}/ThisIsNotAPath`);
    //   assert.equal(f.status, 404);
    // },
    RailsHas404Page: async () => {
      return async (domain, railsPort, remixPort, pm) => {
        const backend = `http://${domain}:${railsPort}/ThisIsNotAPath`; //``;

        const f = await fetch(backend);
        assert.equal(f.status, 404);
      };
    },
    ThereIsARemixFrontPage: async () => {
      return async (domain, railsPort, remixPort, pm: PM_Web) => {
        const frontend = `http://${domain}:${remixPort}`;
        // const f = await fetch();
        // assert.equal(f.status, 404);
        const p = (await pm.newPage()) as string;

        await pm.goto(p, frontend);
        await pm.customScreenShot({ path: "ThereIsARemixFrontPage.jpg" }, p);
      };
    },
    TheGreetingsAre: async (expected) => {
      return async (domain, railsPort, remixPort, pm: PM) => {
        const remixFrontPage = `http://${domain}:${remixPort}`;
        const p = (await pm.newPage()) as string;
        await pm.goto(p, remixFrontPage);
        await pm.customScreenShot({ path: "TheGreetingsAre.jpg" }, p);
        const g = await pm.getInnerHtml("#greetings", p);

        // const expected = JSON.parse(expectedGreeting);
        const actual = JSON.parse(g);
        assert.deepEqual(actual, expected);
      };
    },
  },

  checks: {
    Default: () => new Rectangle(2, 2),
  },
};

export type I = Ibdd_in<
  string,
  string,
  [string, number, number, number],
  [string, number, number, number],
  [string, number],
  (...x) => (rectangle: Rectangle, utils: IPM) => Rectangle,
  () => (
    domain: string,
    railsPort: number,
    remixPort: number,
    utils: IPM
  ) => any
>;

async function poll(
  url,
  checkCondition,
  interval = 3000,
  maxAttempts = Infinity
) {
  console.log("polling for url", url);
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.text();

      if (checkCondition(response.status)) {
        console.log(url, "is AOK");
        return data;
      }
    } catch (_e) {
      console.error(url, "is not up... trying again in 3 seconds.");
    }

    attempts++;
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(`Max attempts reached without success`);
}

let railsPort;
let remixPort;

export const tInterface: IPartialInterface<I> = {
  beforeAll: async (domain, tr, pm) => {
    railsPort = tr.ports[0];
    remixPort = tr.ports[0];
    return domain;
  },
  afterAll: async (x, pm) => {
    return x;
  },
  beforeEach: async (domain, givenInititializer, tr, iv, pm) => {
    await givenInititializer();

    const [uid, tr2]: [number, ITTestResourceConfiguration] =
      await pm.launchSideCar(0);

    const railsHealth = `http://localhost:${tr2.ports[0]}/up`;

    await poll(railsHealth, (n: number) => n === 200);

    const remixHealth = `http://localhost:${tr2.ports[1]}`;

    await poll(remixHealth, (n: number) => n === 200);

    return [domain, uid, tr2.ports[0], tr2.ports[1]];
  },

  afterEach: async (x, k, pm) => {
    await pm.stopSideCar(x[1]);
    return x;
  },

  andWhen: async function (s, whenCB, tr, utils) {
    await (await whenCB(s, utils))(s, utils);
    return s;
  },

  butThen: async (
    [domain, railsSidecar, railsPort, remixPort],
    thenCb,
    tr,
    pm
  ) => {
    await (
      await thenCb()
    )(domain, railsPort, remixPort, pm);
    return [domain, railsSidecar, railsPort, remixPort];
  },
};

export type O = Ibdd_out<
  {
    Default: [string];
  },
  {
    EmptyDb;
    SeededDb;
  },
  {
    ATodoIsAdded: [string];
  },
  {
    RailsHas404Page: [];
    ThereIsARemixFrontPage: [];
    TheGreetingsAre: [{ greetingsSortedAndJoined: string }];
  },
  {
    Default;
  }
>;

const spec: ITestSpecification<I, O> = (Suite, Given, When, Then, Check) => {
  return [
    Suite.Default(
      "Testing the Rails app",
      {
        test0: Given.EmptyDb(
          ["https://api.github.com/repos/adamwong246/testeranto/issues/8"],
          [],
          [
            Then.ThereIsARemixFrontPage(),
            Then.RailsHas404Page()
          ]
        ),

        test1: Given.EmptyDb(
          ["https://api.github.com/repos/adamwong246/testeranto/issues/8"],
          [],
          [
            Then.TheGreetingsAre({"greetingsSortedAndJoined": ""})
          ]
        ),
        "test1.1": Given.EmptyDb(
          ["https://api.github.com/repos/adamwong246/testeranto/issues/8"],
          [When.ATodoIsAdded("salutations")],
          [Then.TheGreetingsAre({ greetingsSortedAndJoined: "salutations" })]
        ),
        "test1.2": Given.EmptyDb(
          ["https://api.github.com/repos/adamwong246/testeranto/issues/8"],
          [
            When.ATodoIsAdded("whats up"),
            When.ATodoIsAdded("good afternoon"),
            When.ATodoIsAdded("howdy"),
          ],
          [Then.TheGreetingsAre({ greetingsSortedAndJoined: "good afternoon ---> howdy ---> whats up" })]
        ),
        "test1.3": Given.EmptyDb(
          ["https://api.github.com/repos/adamwong246/testeranto/issues/8"],
          [When.ATodoIsAdded("ollo?")],
          [Then.TheGreetingsAre({ greetingsSortedAndJoined: "ollo?" })]
        ),

        test2: Given.SeededDb(
          ["https://api.github.com/repos/adamwong246/testeranto/issues/8"],
          [],
          [
            Then.TheGreetingsAre({ greetingsSortedAndJoined: "aloha ---> hello ---> mushi mushi" })
          ]
        ),

        // test3: Given.EmptyDb(
        //   ["https://api.github.com/repos/adamwong246/testeranto/issues/8"],
        //   [
        //     When.ATodoIsAdded("beunosdias")
        //   ],
        //   [
        //     Then.TheGreetingsAre("hello->aloha->beunosdias")
        //   ]
        // ),
      },

      []
    ),
  ];
};

export default Testeranto<I, O, M>(
  "localhost",
  spec,
  implementation,
  tInterface
);
