import {
  assertEquals,
  assertGreater,
  assertGreaterOrEqual,
  assertInstanceOf,
  assertNotEquals,
} from "@std/assert";
import { type Amount, Backtest, type Instrument } from "./backtest.ts";
import { makeMarket } from "./testinstrument.ts";
import { doNothing, randomTrading } from "./strategies.ts";

Deno.test("Instance", () => {
  const market = makeMarket();
  const simulation = new Backtest(market, doNothing, 10000, 0.001, 0.001);
  assertInstanceOf(simulation, Backtest);
});

Deno.test("Run simulation", () => {
  const amount: Amount = 10000;
  const market = makeMarket();
  const offset = market.start;
  const simulation = new Backtest(market, doNothing, amount, 0.001, 0.001);
  simulation.run();
  assertEquals(simulation.cash.length, market.end - market.start + 1);
  assertEquals(simulation.cash[market.start - offset], amount);
  assertEquals(simulation.cash[market.end - offset], amount);
  assertEquals(simulation.invested[market.start - offset], 0);
  assertEquals(simulation.invested[market.end - offset], 0);
  assertEquals(simulation.value[market.start - offset], amount);
  assertEquals(simulation.value[market.end - offset], amount);
});

Deno.test("Random strategy", () => {
  const amount: Amount = 10000;
  const market = makeMarket();
  const simulation = new Backtest(market, randomTrading, amount, 0.001, 0.001);
  simulation.run();
  assertNotEquals(simulation.value[simulation.value.length - 1], amount);
  assertGreaterOrEqual(simulation.positions.length, 0);
  assertGreater(simulation.transactions.length, 0);
});
