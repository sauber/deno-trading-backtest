import { assertEquals, assertGreater, assertInstanceOf } from "@std/assert";
import { Simulation } from "./simulation.ts";
import { Market } from "./market.ts";
import { makeInstruments, TestStrategy } from "./testdata.ts";

// Initialize a market with a count of random instruments
function makeMarket(count: number): Market {
  return new Market(makeInstruments(count));
}

Deno.test("Instance", () => {
  assertInstanceOf(
    new Simulation(makeMarket(0), new TestStrategy()),
    Simulation
  );
});

Deno.test("Steps", () => {
  const market = makeMarket(1);
  const s = new Simulation(market, new TestStrategy());
  assertEquals(s.performance.steps, 0);
  s.run();
  const days: number = market.start - market.end;
  assertEquals(s.performance.steps, days + 1);
});

Deno.test("Buying and selling", () => {
  const market = makeMarket(10);
  const s = new Simulation(market, new TestStrategy());
  assertEquals(s.performance.steps, 0);
  s.run();
  assertGreater(s.performance.buys, 0);
  assertGreater(s.performance.sells, 0);
});
