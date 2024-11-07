import {
  assertArrayIncludes,
  assertEquals,
  assertInstanceOf,
} from "@std/assert";
import { LimitStrategy, NullStrategy, Strategy } from "./strategy.ts";
import { RandomInstrument } from "./testdata.ts";

const active = [ new RandomInstrument, new RandomInstrument];

Deno.test("Strategy Instance", () => {
  const s = new Strategy();
  assertInstanceOf(s, Strategy);
  assertEquals(s.buy(), []);
  assertEquals(s.sell(), []);
});

Deno.test("Prepend", () => {
  const child = new Strategy();
  const parent = new Strategy();
  const chain = child.prepend(parent);
  assertEquals(chain, child);
  assertEquals(chain.buy(), []);
  assertEquals(chain.sell(), []);
});

Deno.test("Append", () => {
  const child = new Strategy();
  const parent = new Strategy();
  const chain = parent.append(child);
  assertEquals(chain, child);
  assertEquals(chain.buy(), []);
  assertEquals(chain.sell(), []);
});

Deno.test("Random Strategy", () => {
  const s = new Strategy({ instruments: active }).random();
  assertArrayIncludes([0, 1], [s.buy().length]);
  assertEquals(s.sell(), []);
});

Deno.test("Limit Strategy", () => {
  const s = new LimitStrategy(5);
  assertEquals(s.buy(), []);
  assertEquals(s.sell(), []);
});

Deno.test("Null Strategy", () => {
  const s = new NullStrategy();
  assertEquals(s.buy(), []);
  assertEquals(s.sell(), []);
});
