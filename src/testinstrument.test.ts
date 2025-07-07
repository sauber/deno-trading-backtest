import {
  assertEquals,
  assertGreater,
  assertInstanceOf,
  assertNotEquals,
} from "@std/assert";

import { createTestInstrument } from "./testinstrument.ts";
import { Instrument } from "./instrument.ts";

Deno.test("Instance", () => {
  assertInstanceOf(createTestInstrument(), Instrument);
});

Deno.test("Properties", () => {
  const i = createTestInstrument();
  assertEquals(i.symbol.length, 4);
  assertGreater(i.name?.length, 0);
  assertEquals(i.start - i.end, i.length - 1);
  assertNotEquals(i.first, i.last);
});

Deno.test("Print", { ignore: true }, () => {
  const i = createTestInstrument();
  console.log(i.plot());
});
