import {
  assertEquals,
  assertGreater,
  assertInstanceOf,
  assertNotEquals,
} from "@std/assert";
import { makeInstrument } from "./testinstrument.ts";
import { Instrument } from "./backtest.ts";

Deno.test("Instance", () => {
  assertInstanceOf(makeInstrument(), Instrument);
});

Deno.test("Properties", () => {
  const length = 20;
  const i = makeInstrument(length);
  assertEquals(i.symbol.length, 4);
  assertGreater(i.name?.length, 0);
  assertEquals(i.series.length, length);
  assertEquals(i.end - i.start, i.length - 1);
  assertNotEquals(i.first, i.last);
});
