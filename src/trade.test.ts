import { assertEquals, assertInstanceOf } from "@std/assert";
import { Trade } from "./trade.ts";
import { makePosition } from "./testdata.ts";
import type { Amount, Bar } from "./types.ts";
import type { Position } from "./position.ts";

const amount: Amount = 1000;
const position: Position = makePosition(amount);
const end: Bar = position.instrument.end;

Deno.test("Instance", () => {
  const trade = new Trade(position, end, amount, "Close");
  assertInstanceOf(trade, Trade);
});

Deno.test("Length", () => {
  const trade = new Trade(position, end, amount, "Close");
  assertEquals(trade.length, position.instrument.start - end);
});

Deno.test("Profit", () => {
  const trade = new Trade(position, end, amount, "Close");
  assertEquals(
    trade.profit,
    position.value(end) - position.value(position.start),
  );
});
