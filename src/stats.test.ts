import { assertEquals, assertInstanceOf } from "@std/assert";
import { Stats } from "./stats.ts";
import { Account } from "./account.ts";
import { makeExchange } from "./testdata.ts";

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

// Deno.test("Profit", () => {
//   const s = new Stats();
//   assertEquals(s.profit, 0);
//   s.tick({ cash: 2, invested: 0, profit: 0 });
//   assertEquals(s.profit, 0);
//   s.tick({ cash: 4, invested: 0, profit: 0 });
//   assertEquals(s.profit, 1);
// });

// Deno.test("Winratio", () => {
//   const s = new Stats();
//   assertEquals(s.winratio, undefined);
//   s.trade(new Date(), new Date(), 0, 0);
//   assertEquals(s.winratio, undefined);
//   s.trade(new Date(), new Date(), 0, 1);
//   assertEquals(s.winratio, 1);
//   s.trade(new Date(), new Date(), 1, 0);
//   assertEquals(s.winratio, 0.5);
// });
