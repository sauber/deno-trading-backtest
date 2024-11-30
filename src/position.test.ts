import { assertEquals, assertInstanceOf, assertNotEquals } from "@std/assert";
import { makeInstrument } from "./testdata.ts";
import { Position, type PositionID } from "./position.ts";
import type { Amount, Bar, Price } from "./types.ts";
import type { Instrument } from "./instrument.ts";

const instr: Instrument = makeInstrument();

Deno.test("Instance", () => {
  const p = new Position(instr, 0, 0, 0, 0, 0);
  assertInstanceOf(p, Position);
});

Deno.test("Invested", () => {
  const amount: Amount = 1000;
  const units = 10;
  const price: Price = 100;
  const bar: Bar = 0;
  const id: PositionID = 0;
  const p = new Position(instr, amount, price, units, bar, id);
  assertEquals(p.invested, amount);
});

Deno.test("Value", () => {
  const amount: Amount = 1000;
  const units = 10;
  const price: Price = 100;
  const id: PositionID = 0;
  const pos: Position = new Position(
    instr,
    amount,
    price,
    units,
    instr.start,
    id,
  );

  const purchaseValue: Amount = amount;
  const currentValue: Amount = pos.value(instr.end);
  assertNotEquals(currentValue, purchaseValue);
});
