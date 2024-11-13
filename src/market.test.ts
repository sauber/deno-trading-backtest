import { assertInstanceOf, assertLess } from "@std/assert";
import type { Instruments } from "./types.ts";
import { Market } from "./market.ts";
import { TestInstrument } from "./testdata.ts";

Deno.test("Instance", () => {
  const market = new Market([]);
  assertInstanceOf(market, Market);
});

Deno.test("Dates", () => {
  const i: Instruments = [ new TestInstrument, new TestInstrument];
  const market = new Market(i);
  // console.log(market.start, market.end);
  assertLess(market.start, market.end)
});

