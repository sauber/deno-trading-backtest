import { assertEquals, assertInstanceOf } from "@std/assert";
import { Simulation } from "./simulation.ts";
import { Market } from "./market.ts";
import { makeInstruments } from "./testdata.ts";
import { NullStrategy } from "./strategy.ts";
import { Strategy } from "./strategy.ts";

// Initialize a market with a count of random instruments
function makeMarket(count: number): Market {
  return new Market(makeInstruments(count));
}

Deno.test("Instance", () => {
  assertInstanceOf(
    new Simulation(makeMarket(0), new NullStrategy()),
    Simulation
  );
});

Deno.test("Steps", () => {
  const market = makeMarket(1);
  const s = new Simulation(market, new NullStrategy());
  assertEquals(s.performance.steps, 0);
  s.run();
  const days: number = market.start - market.end;
  assertEquals(s.performance.steps, days + 1);
});

Deno.test("Buying", () => {
  const market = makeMarket(1);
  const s = new Simulation(market, new NullStrategy());
  assertEquals(s.performance.steps, 0);
  s.run();
  assertEquals(s.performance.buys, 0);
});

Deno.test("Random Strategy", () => {
  const market = makeMarket(3);
  const strategy = new Strategy().random().max(4000);
  // const strategy = new LimitStrategy(2);
  const s = new Simulation(market, strategy);
  // strategy.print();
  assertEquals(s.performance.steps, 0);
  s.run();
  console.log(s.account.statement);
  // const days: number = market.start - market.end;
  // assertEquals(s.performance.steps, days + 1);
});
