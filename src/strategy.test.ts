import {
  assertArrayIncludes,
  assertEquals,
  assertInstanceOf,
} from "@std/assert";
import { LimitStrategy, NullStrategy, Strategy } from "./strategy.ts";
import { TestInstrument } from "./testdata.ts";

const active = [ new TestInstrument, new TestInstrument];

Deno.test("Strategy Instance", () => {
  const s = new Strategy();
  assertInstanceOf(s, Strategy);
  assertEquals(s.buy().positions, []);
  assertEquals(s.sell().positions, []);
});

Deno.test("Prepend", () => {
  const child = new Strategy();
  const parent = new Strategy();
  const chain = child.prepend(parent);
  assertEquals(chain, child);
  assertEquals(chain.buy().positions, []);
  assertEquals(chain.sell().positions, []);
});

Deno.test("Append", () => {
  const child = new Strategy();
  const parent = new Strategy();
  const chain = parent.append(child);
  assertEquals(chain, child);
  assertEquals(chain.buy().positions, []);
  assertEquals(chain.sell().positions, []);
});

Deno.test("Random Strategy", () => {
  const s = new Strategy({ instruments: active }).random();
  assertArrayIncludes([0, 1], [s.buy().length]);
  assertEquals(s.sell().positions, []);
});

Deno.test("Limit Strategy", () => {
  const s = new LimitStrategy(5);
  assertEquals(s.buy().positions, []);
  assertEquals(s.sell().positions, []);
});

Deno.test("Null Strategy", () => {
  const s = new NullStrategy();
  assertEquals(s.buy().positions, []);
  assertEquals(s.sell().positions, []);
});
