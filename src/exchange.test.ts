import { Exchange } from "./exchange.ts";
import { makeInstruments } from "./testdata.ts";
import {
  assertAlmostEquals,
  assertGreater,
  assertInstanceOf,
} from "@std/assert";
import { Account } from "./account.ts";
import type { Amount, Bar, Instrument } from "./types.ts";
import type { Position } from "./position.ts";

const instruments = makeInstruments(3);

Deno.test("Instance", () => {
  const ex = new Exchange(instruments);
  assertInstanceOf(ex, Exchange);
});

Deno.test("Dates", () => {
  const ex = new Exchange(instruments);
  assertGreater(ex.start, ex.end);
});

Deno.test("Create Account", () => {
  const ex = new Exchange(instruments);
  const ac: Account = ex.createAccount();
  assertInstanceOf(ac, Account);
});

Deno.test("Buy and selling", () => {
  const ex = new Exchange(instruments);

  const start: Bar = 0;
  const instr: Instrument = ex.on(start)[0];
  const amount: Amount = 1000;
  const position: Position = ex.buy(instr, amount, start);
  assertAlmostEquals(position.price * position.units, amount);

  const end: Bar = 0;
  const returns: Amount = ex.sell(position, end);

  // Selling at same bar as buying should return same amount as invested,
  // when trading is free of fees.
  assertAlmostEquals(returns, amount);
});
