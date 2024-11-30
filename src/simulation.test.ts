import { assertEquals, assertInstanceOf } from "@std/assert";
import { Simulation } from "./simulation.ts";
import { makeExchange, MaybeStrategy } from "./testdata.ts";
import type { Stats } from "./stats.ts";

const ex = makeExchange(3);

Deno.test("Instance", () => {
  assertInstanceOf(
    new Simulation(ex, new MaybeStrategy()),
    Simulation,
  );
});

Deno.test("Run simulation", () => {
  const s = new Simulation(ex, new MaybeStrategy());
  const stats: Stats = s.stats;
  assertEquals(stats.bars, 1);
  s.run();
  assertEquals(stats.bars, ex.start - ex.end + 1);
});
