import { assertEquals, assertInstanceOf } from "@std/assert";
import { Account } from "./account.ts";
import { makePosition } from "./testdata.ts";

Deno.test("Instance", () => {
  const account = new Account();
  assertInstanceOf(account, Account);
});

Deno.test("Open with amount", () => {
  const cash = 1000;
  const account = new Account(cash);
  assertEquals(account.balance, cash);
});

Deno.test("Deposits", () => {
  const amount = 100;
  const account = new Account();
  account.deposit(amount);
  assertEquals(account.balance, amount);
  account.deposit(amount);
  assertEquals(account.balance, 2 * amount);
});

Deno.test("Withdrawals", () => {
  const open = 2000;
  const amount = 100;
  const account = new Account(open);
  account.withdraw(amount);
  assertEquals(account.balance, open - amount);
  account.withdraw(amount);
  assertEquals(account.balance, open - 2 * amount);
});

Deno.test("Open", () => {
  const start = 2000;
  const amount = 100;
  const account = new Account(start);
  const pos = makePosition(amount);
  const success: boolean = account.add(pos, amount);
  assertEquals(success, true);
  assertEquals(account.balance, start - amount);
});

Deno.test("Open exceeds funds", () => {
  const start = 2000;
  const amount = 2001;
  const account = new Account(start);
  const pos = makePosition(amount);
  const success: boolean = account.add(pos, amount);
  assertEquals(success, false);
  assertEquals(account.balance, start);
});

Deno.test("Close", () => {
  const start = 2000;
  const amount = 100;
  const account = new Account(start);
  const pos = makePosition(amount);
  account.add(pos, amount);
  account.remove(pos, amount);
  assertEquals(account.balance, start);
});
