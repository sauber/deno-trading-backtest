import { assertEquals, assertInstanceOf, assertNotEquals } from "@std/assert";
import { makeInstrument } from "./testdata.ts";
import { Position } from "./position.ts";
import type { Amount, Bar, Instrument, Price } from "./types.ts";

const instr: Instrument = makeInstrument();

Deno.test("Instance", () => {
  const p = new Position(instr, 0, 0, 0, 0);
  assertInstanceOf(p, Position);
});

Deno.test("Invested", () => {
  const amount: Amount = 1000;
  const units = 10;
  const price: Price = 100;
  const bar: Bar = 0;
  const p = new Position(instr, amount, price, units, bar);
  assertEquals(p.invested, amount);
});

Deno.test("Value", () => {
  const amount: Amount = 1000;
  const units = 10;
  const price: Price = 100;
  const pos: Position = new Position(instr, amount, price, units, instr.start);

  const purchaseValue: Amount = amount;
  const currentValue: Amount = pos.value(instr.end);
  assertNotEquals(currentValue, purchaseValue);
});
