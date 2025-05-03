import { createRequire } from 'module';const require = createRequire(import.meta.url);
import {
  Node_default
} from "../chunk-DUUOMID7.mjs";

// src/rails-test.ts
import assert from "assert";
var RectangleTesterantoBaseTestImplementation = {
  suites: {
    Default: "an empty rails app"
  },
  givens: {
    Default: null
  },
  whens: {},
  thens: {
    ThereIsA404Page: async () => {
      return async (dd, pp) => {
        console.log("ThereIsA404Page", dd, pp);
        const backend = `${dd}:${pp}`;
        console.log("fetch", backend);
        const f = await fetch(`http://${backend}/ThisIsNotAPath`);
        console.log("fetched", f.status);
        assert.equal(f.status, 404);
      };
    }
  },
  checks: {
    Default: () => new Rectangle(2, 2)
  }
};
async function poll(url, checkCondition, interval = 3e3, maxAttempts = Infinity) {
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
var RectangleTesterantoBaseInterface = {
  beforeAll: async (domain, tr, pm) => {
    const [uid, tr2] = await pm.launchSideCar(0);
    const helthPath = `http://localhost:${tr2.ports[0]}/up`;
    await poll(helthPath, (n) => n === 200);
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
  andWhen: async function(s, whenCB, tr, utils) {
    whenCB(s)(s, utils);
    return s;
  },
  butThen: async ([domain, railsSidecar, railsPort], thenCb) => {
    await (await thenCb())(domain, railsPort);
    return [domain, railsSidecar, railsPort];
  }
};
var RectangleTesterantoBaseTestSpecification = (Suite, Given, When, Then, Check) => {
  return [
    Suite.Default(
      "Testing the Rails app",
      {
        test0: Given.Default(
          ["https://api.github.com/repos/adamwong246/testeranto/issues/8"],
          [],
          [Then.ThereIsA404Page()]
        )
      },
      []
    )
  ];
};
var rails_test_default = Node_default(
  "localhost",
  RectangleTesterantoBaseTestSpecification,
  RectangleTesterantoBaseTestImplementation,
  RectangleTesterantoBaseInterface
);
export {
  RectangleTesterantoBaseInterface,
  RectangleTesterantoBaseTestImplementation,
  rails_test_default as default
};
