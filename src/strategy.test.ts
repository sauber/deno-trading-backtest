import {
  assertArrayIncludes,
  assertEquals,
  assertInstanceOf,
  assertLessOrEqual,
} from "@std/assert";
import { LimitStrategy, NullStrategy, Strategy } from "./strategy.ts";
import { makeInstruments, makePositions } from "./testdata.ts";

const instruments = makeInstruments(2);
const positions = makePositions(2, 1000);

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
  const s = new Strategy({ instruments, positions }).random();

  // Confirm count of sell is sometimes 0 and never more than 1
  let count: number;
  do {
    const sell = s.sell();
    count = sell.length;
    assertLessOrEqual(count, 1);
    assertArrayIncludes(positions, sell);
  } while (count != 0);

  // Confirm count of sell is sometimes 1 and never more than 1
  do {
    const sell = s.sell();
    count = sell.length;
    assertLessOrEqual(count, 1);
    assertArrayIncludes(positions, sell);
  } while (count != 1);

  // Confirm count of buy is sometimes 0 and never more than 1
  do {
    const buy = s.buy();
    count = buy.length;
    assertLessOrEqual(count, 1);
  } while (count != 0);

  // Confirm count of buy is sometimes 1 and never more than 1
  do {
    const buy = s.sell();
    count = buy.length;
    assertLessOrEqual(count, 1);
  } while (count != 1);
});

Deno.test("Exit Strategy", () => {
  const s = new Strategy({ instruments, positions }).exit();
  assertEquals(s.buy(), []);
  assertEquals(s.sell(), positions);
});

Deno.test("Limit Strategy", () => {
  const zero = new LimitStrategy(0, { instruments, positions });
  assertEquals(zero.buy().length, 0);
  assertEquals(zero.sell().length, 0);

  const one = new LimitStrategy(1, { instruments, positions });
  assertEquals(one.buy().length, 1);
  assertEquals(one.sell().length, 1);

  const two = new LimitStrategy(2, { instruments, positions });
  assertEquals(two.buy().length, 2);
  assertEquals(two.sell().length, 2);

  const three = new LimitStrategy(3, { instruments, positions });
  assertEquals(three.buy().length, 2);
  assertEquals(three.sell().length, 2);
});

Deno.test("Null Strategy", () => {
  const s = new NullStrategy({ instruments, positions });
  assertEquals(s.buy(), []);
  assertEquals(s.sell(), []);
});
