import { assertEquals, assertInstanceOf } from "@std/assert";
import { Account } from "./account.ts";
import { makeInstruments } from "./testdata.ts";
import { Exchange } from "./exchange.ts";
import type { Amount, Bar } from "./types.ts";
import type { Instrument } from "./instrument.ts";
import { Position } from "./position.ts";

const ex: Exchange = new Exchange(makeInstruments(3));

Deno.test("Instance", () => {
  const account = new Account(ex);
  assertInstanceOf(account, Account);
});

Deno.test("Open with amount", () => {
  const deposit: Amount = 1000;
  const account = new Account(ex, deposit);
  assertEquals(account.balance, deposit);
});

Deno.test("Deposits", () => {
  const deposit: Amount = 100;
  const account = new Account(ex);
  account.deposit(deposit);
  assertEquals(account.balance, deposit);
  account.deposit(deposit);
  assertEquals(account.balance, 2 * deposit);
});

Deno.test("Withdrawals", () => {
  const deposit: Amount = 2000;
  const withdraw: Amount = 100;
  const account = new Account(ex, deposit);
  account.withdraw(withdraw);
  assertEquals(account.balance, deposit - withdraw);
  account.withdraw(withdraw);
  assertEquals(account.balance, deposit - 2 * withdraw);
});

Deno.test("Open", () => {
  const deposit: Amount = 2000;
  const amount: Amount = 100;
  const instrument: Instrument = ex.any();
  const start: Bar = instrument.start;
  const account = new Account(ex, deposit, start);
  const position = account.add(instrument, amount, start);
  assertInstanceOf(position, Position);
  assertEquals(account.balance, deposit - amount);
});

Deno.test("Open exceeds funds", () => {
  const deposit: Amount = 2000;
  const amount: Amount = 2001;
  const instrument: Instrument = ex.any();
  const start: Bar = instrument.start;
  const account = new Account(ex, deposit, start);
  const position = account.add(instrument, amount, start);
  assertEquals(position, undefined);
  assertEquals(account.balance, deposit);
});

Deno.test("Close", () => {
  const deposit: Amount = 2000;
  const amount: Amount = 100;
  const instrument: Instrument = ex.any();
  const start: Bar = instrument.start;
  const account = new Account(ex, deposit, start);
  const position = account.add(instrument, amount, start);
  assertInstanceOf(position, Position);
  account.remove(position, start);
  assertEquals(account.balance, deposit);
});

Deno.test("Automatic valuation", () => {
  const deposit: Amount = 100;
  const start: Bar = 2;
  const account = new Account(ex, deposit, start);
  const end: Bar = 0;
  account.withdraw(deposit, end);
  assertEquals(account.valuation, [deposit, deposit, deposit]);
});

Deno.test("List of no trades", () => {
  const deposit: Amount = 100;
  const start: Bar = 2;
  const account = new Account(ex, deposit, start);
  assertEquals(account.trades.length, 0);
});
