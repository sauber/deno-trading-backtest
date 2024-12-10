import {
  assertEquals,
  assertGreater,
  assertInstanceOf,
  assertNotEquals,
} from "@std/assert";

import { TestInstrument } from "./testinstrument.ts";

Deno.test("Instance", () => {
  assertInstanceOf(new TestInstrument(), TestInstrument);
});

Deno.test("Properties", () => {
  const i = new TestInstrument();
  assertEquals(i.symbol.length, 4);
  assertGreater(i.name?.length, 0);
  assertEquals(i.start - i.end, i.length - 1);
  assertNotEquals(i.first, i.last);
});

Deno.test("Print", { ignore: true }, () => {
  const i = new TestInstrument();
  console.log(i.plot());
});
