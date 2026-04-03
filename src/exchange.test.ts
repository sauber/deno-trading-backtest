import { Exchange } from "./exchange.ts";
import { Market } from "./market.ts";
import { makeInstruments } from "./testdata.ts";
import {
  assertAlmostEquals,
  assertEquals,
  assertGreater,
  assertInstanceOf,
} from "@std/assert";
import { Account } from "./account.ts";
import type { Instrument } from "./instrument.ts";
import type { Amount, Bar } from "./types.ts";
import type { Position } from "./position.ts";

const instruments = makeInstruments(3);

Deno.test("Instance", () => {
  const ex = new Exchange();
  assertInstanceOf(ex, Exchange);
});

Deno.test("Dates", () => {
  const market = new Market(instruments);
  assertGreater(market.start, market.end);
});

Deno.test("Create Account", () => {
  const ex = new Exchange();
  const ac: Account = ex.createAccount();
  assertInstanceOf(ac, Account);
});

Deno.test("Buy and selling", () => {
  const market = new Market(instruments);
  const ex = new Exchange();

  const instr: Instrument = market.any();
  const start: Bar = market.start;
  const amount: Amount = 1000;
  const position: Position = ex.buy(instr, amount, start);
  assertAlmostEquals(position.price * position.units, amount);

  const returns: Amount = ex.sell(position, start);

  // Selling at same bar as buying should return same amount as invested,
  // when trading is free of fees.
  assertAlmostEquals(returns, amount);
});

Deno.test("Get instrument", () => {
  const market = new Market(instruments);
  const any: Instrument = market.any();
  const symbol = any.symbol;
  const instrument = market.get(symbol);
  assertEquals(instrument, any);
});
