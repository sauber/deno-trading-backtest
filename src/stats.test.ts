import { assertEquals, assertInstanceOf, assertNotEquals } from "@std/assert";
import { Stats } from "./stats.ts";
import { Account } from "./account.ts";
import { makeExchange } from "./testdata.ts";
import type { Amount, Bar, Instrument } from "./types.ts";
import type { Position } from "./position.ts";

const ex = makeExchange(3);

Deno.test("Instance", () => {
  const account = new Account(ex);
  assertInstanceOf(new Stats(account), Stats);
});

Deno.test("No activity", () => {
  const account = new Account(ex);
  const s = new Stats(account);
  assertEquals(s.bars, 1);
});

Deno.test("Bars from first to last activity", () => {
  const account = new Account(ex, 1000, 10);
  account.withdraw(1000, 0);
  const s = new Stats(account);
  assertEquals(s.bars, 11);
});

Deno.test("SharpeRatio", () => {
  const instr: Instrument = ex.any();
  const start: Bar = instr.start;
  const end: Bar = instr.end;
  const deposit: Amount = 1000;
  const account = new Account(ex, deposit, start);

  // Open position
  const position = account.add(instr, deposit, start) as Position;

  // Close position
  account.remove(position, end);

  // Generate stats
  const s = new Stats(account);
  assertNotEquals(s.sharperatio, 0);
});
