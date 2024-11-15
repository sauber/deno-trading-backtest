import { assertEquals, assertInstanceOf } from "@std/assert";
import { Simulation } from "./simulation.ts";
import { Market } from "./market.ts";
import { TestInstrument } from "./testdata.ts";
import { NullStrategy } from "./strategy.ts";
import type { Instruments } from "./types.ts";
import { Strategy } from "./strategy.ts";

// Create array from callback
function repeat<T>(callback: () => T, count: number): Array<T> {
  return Array.from(Array(count).keys().map(callback));
}

/** A list of random instruments */
export function instruments(count: number): Instruments {
  return repeat(() => new TestInstrument(), count);
}

// Initialize a market with a count of random instruments
function makeMarket(count: number): Market {
  return new Market(instruments(count));
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
  const market = makeMarket(10);
  const s = new Simulation(market, new Strategy({amount: 1000}).random());
  assertEquals(s.performance.steps, 0);
  s.run();
  const days: number = market.start - market.end;
  assertEquals(s.performance.steps, days + 1);
  console.log(s.account.statement);
});
