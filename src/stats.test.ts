import { assertEquals, assertInstanceOf, assertNotEquals } from "@std/assert";
import { Stats } from "./stats.ts";
import type { Account } from "./account.ts";
import { makeExchange } from "./testdata.ts";
import type { Amount, Bar, Instrument } from "./types.ts";
import type { Position } from "./position.ts";

const ex = makeExchange(3);

Deno.test("Instance", () => {
  const account: Account = ex.createAccount();
  assertInstanceOf(new Stats(account), Stats);
});

Deno.test("No activity", () => {
  const account = ex.createAccount();
  const stats = new Stats(account);
  assertEquals(stats.bars, 1);
});

Deno.test("Bars from first to last activity", () => {
  const account: Account = ex.createAccount(1000, 10);
  account.withdraw(1000, 0);
  const stats = new Stats(account);
  assertEquals(stats.bars, 11);
});

Deno.test("SharpeRatio", () => {
  const instr: Instrument = ex.any();
  const start: Bar = instr.start;
  const end: Bar = instr.end;
  const deposit: Amount = 1000;
  const account: Account = ex.createAccount(deposit, start);

  // Open position
  const position = account.add(instr, deposit, start) as Position;

  // Close position
  account.remove(position, end);

  // Generate stats
  const stats = new Stats(account);
  assertNotEquals(stats.sharperatio, 0);
});

Deno.test("Trade Count", () => {
  const instr: Instrument = ex.any();
  const start: Bar = instr.start;
  const end: Bar = instr.end;
  const deposit: Amount = 1000;
  const account: Account = ex.createAccount(deposit, start);
  const stats = new Stats(account);
  assertEquals(stats.trades.length, 0);

  // Open position
  const position = account.add(instr, deposit, start) as Position;
  assertEquals(stats.trades.length, 0);

  // Close position
  account.remove(position, end);
  assertEquals(stats.trades.length, 1);
});

Deno.test("Profit", () => {
  const instr: Instrument = ex.any();
  const start: Bar = instr.start;
  const end: Bar = instr.end;
  const deposit: Amount = 1000;
  const account: Account = ex.createAccount(deposit, start);
  const stats = new Stats(account);
  assertEquals(stats.profit, 0);

  // Open position
  const position = account.add(instr, deposit, start) as Position;
  assertEquals(stats.profit, 0);

  // Close position
  account.remove(position, end);
  assertNotEquals(stats.profit, 0);
});
