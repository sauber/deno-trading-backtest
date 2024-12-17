import { assertEquals, assertInstanceOf } from "@std/assert";
import { Simulation } from "./simulation.ts";
import { makeExchange, MaybeStrategy } from "./testdata.ts";

const ex = makeExchange(3);

Deno.test("Instance", () => {
  assertInstanceOf(
    new Simulation(ex, new MaybeStrategy()),
    Simulation,
  );
});

Deno.test("Run simulation", () => {
  const s = new Simulation(ex, new MaybeStrategy());
  assertEquals(s.account.bars, 1);
  s.run();
  assertEquals(s.account.bars, ex.start - ex.end + 1);
});
