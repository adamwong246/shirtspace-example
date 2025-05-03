import Testeranto from "testeranto/src/Node";

// import {
//   M,
//   RectangleTesterantoBaseTestImplementation,
// } from "./Rectangle.test.implementation";
// import {
//   O,
//   RectangleTesterantoBaseTestSpecification,
// } from "./Rectangle.test.specification";
// import {
//   I,
//   RectangleTesterantoBaseInterface,
// } from "./Rectangle.test.interface";

import {
  Ibdd_in,
  Ibdd_out,
  IPartialInterface,
  ITestImplementation,
  ITestSpecification,
} from "testeranto/src/Types";
import { IPM } from "../../testeranto/src/lib/types";
import assert from "assert";
import { PM } from "../../testeranto/src/PM";
import { ITTestResourceConfiguration } from "testeranto/src/lib";

export type M = {
  givens: {
    [K in keyof O["givens"]]: null;
  };
  whens: {
    [K in keyof O["whens"]]: (
      ...Iw: O["whens"][K]
    ) => (domain: string, tr: ITTestResourceConfiguration, utils: PM) => any;
  };
  thens: {
    [K in keyof O["thens"]]: (
      domain: string,
      p: number,
      utils: PM
    ) => any;
  };
};

export const RectangleTesterantoBaseTestImplementation: ITestImplementation<
  I,
  O,
  M
> = {
  suites: {
    Default: "an empty rails app",
  },

  givens: {
    Default: null,
  },

  whens: {},

  thens: {
    ThereIsA404Page: async () => {
      return async (dd, pp) => {
        console.log("ThereIsA404Page", dd, pp);
        const backend = `${dd}:${pp}`;
        console.log("fetch", backend)
        const f = await fetch(`http://${backend}/ThisIsNotAPath`);
        console.log("fetched", f.status)
        assert.equal(f.status, 404);
      };
    },
  },

  checks: {
    Default: () => new Rectangle(2, 2),
  },
};

export type I = Ibdd_in<
  string,
  [string, number, number],
  [string, number, number],
  [string, number, number],
  [string, number],
  (...x) => (rectangle: Rectangle, utils: IPM) => Rectangle,
  (domain: string, tr: ITTestResourceConfiguration, utils: IPM) => any
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
        console.log("rails is up!", data);
        return data;
      }
    } catch (error) {
      console.error("server is not up... trying again in 3 seconds.");
    }

    attempts++;
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(`Max attempts reached without success`);
}

export const RectangleTesterantoBaseInterface: IPartialInterface<I> = {
  beforeAll: async (domain, tr, pm) => {
    const [uid, tr2]: [number, ITTestResourceConfiguration] =
      await pm.launchSideCar(0);

    const helthPath = `http://localhost:${tr2.ports[0]}/up`;

    await poll(helthPath, (n: number) => n === 200);
    return [domain, uid, tr2.ports[0]];
  },
  afterAll: async ([domain, railsSidecar, railsPort], pm) => {
    await pm.stopSideCar(railsSidecar);
    return [domain, railsSidecar, railsPort];
  },
  beforeEach: async ([domain, railsSidecar, railsPort]) => {
    return [domain, railsSidecar, railsPort];
  },
  afterEach: async (x) => {
    return x;
  },
  andWhen: async function (s, whenCB, tr, utils) {
    whenCB(s)(s, utils);
    return s;
  },
  butThen: async ([domain, railsSidecar, railsPort], thenCb) => {
    await (await thenCb())(domain, railsPort)    
    return [domain, railsSidecar, railsPort];
  },
};

export type O = Ibdd_out<
  {
    Default: [string];
  },
  {
    Default;
  },
  {},
  {
    ThereIsA404Page: [];
  },
  {
    Default;
  }
>;

const RectangleTesterantoBaseTestSpecification: ITestSpecification<I, O> = (
  Suite,
  Given,
  When,
  Then,
  Check
) => {
  return [
    Suite.Default(
      "Testing the Rails app",
      {
        test0: Given.Default(
          ["https://api.github.com/repos/adamwong246/testeranto/issues/8"],
          [],
          [Then.ThereIsA404Page()]
        ),
      },

      []
    ),
  ];
};

export default Testeranto<I, O, M>(
  "localhost",
  RectangleTesterantoBaseTestSpecification,
  RectangleTesterantoBaseTestImplementation,
  RectangleTesterantoBaseInterface
);
