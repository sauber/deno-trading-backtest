import { assertEquals, assertInstanceOf } from "@std/assert";
import { Simulation } from "./simulation.ts";
import { makeExchange, makeMarket, MaybeStrategy } from "./testdata.ts";

const market = makeMarket(3);
const ex = makeExchange();

Deno.test("Instance", () => {
  assertInstanceOf(
    new Simulation(market, ex, new MaybeStrategy()),
    Simulation,
  );
});

Deno.test("Run simulation", () => {
  const s = new Simulation(market, ex, new MaybeStrategy());
  assertEquals(s.account.bars, 1);
  s.run();
  assertEquals(s.account.bars, market.start - market.end + 1);
});
