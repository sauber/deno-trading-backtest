import { assertInstanceOf } from "@std/assert";
import { type Instruments, Market } from "./market.ts";
import { RandomInstrument } from "./testdata.ts";

Deno.test("Instance", () => {
  const market = new Market([]);
  assertInstanceOf(market, Market);
});

Deno.test("Dates", () => {
  const i: Instruments = [ new RandomInstrument, new RandomInstrument];
  const market = new Market(i);
  console.log(market.start, market.end);
});

Deno.test("Dates", () => {
  const i: Instruments = [ new RandomInstrument, new RandomInstrument];
  const market = new Market(i);
  console.log(market.start, market.end);
});
