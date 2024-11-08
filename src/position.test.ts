import { assertEquals, assertInstanceOf, assertNotEquals } from "@std/assert";
import { TestInstrument } from "./testdata.ts";
import { Position } from "./position.ts";

Deno.test("Instance", () => {
  const p = new Position(new TestInstrument(), 0, 0);
  assertInstanceOf(p, Position);
});

Deno.test("Invested", () => {
  const units = 10;
  const price = 100;
  const p = new Position(new TestInstrument(), units, price);
  assertEquals(p.invested, units * price);
});

Deno.test("Value", () => {
  const inst = new TestInstrument();
  const units = 10;
  const price = inst.price(inst.start);
  const purchaseValue = price * units;
  const pos = new Position(inst, units, price);
  const currentValue = pos.value(inst.end);
  assertNotEquals(currentValue, purchaseValue);
});
