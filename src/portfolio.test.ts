import {
  assertAlmostEquals,
  assertEquals,
  assertGreater,
  assertInstanceOf,
} from "@std/assert";
import { Portfolio } from "./portfolio.ts";
import { Position } from "./position.ts";
import { makeInstrument, makePosition } from "./testdata.ts";
import type { Amount, Bar, Price } from "./types.ts";
import type { Instrument } from "./instrument.ts";

Deno.test("Instance", () => {
  const p = new Portfolio();
  assertInstanceOf(p, Portfolio);
});

Deno.test("Add/remove position", () => {
  const portfolio = new Portfolio();
  const position: Position = makePosition(100);
  portfolio.add(position);
  assertEquals(portfolio.length, 1);
  assertEquals(portfolio.has(position), true);

  portfolio.remove(position);
  assertEquals(portfolio.length, 0);
  assertEquals(portfolio.has(position), false);
});

Deno.test("Amount invested", () => {
  const portfolio = new Portfolio();
  const amount = 100;
  portfolio.add(makePosition(amount));
  portfolio.add(makePosition(amount));
  assertEquals(portfolio.invested, 2 * amount);
});

Deno.test("Value", () => {
  const portfolio = new Portfolio();
  const amount: Amount = 100;
  const instrument: Instrument = makeInstrument();
  const date: Bar = instrument.start;
  const price: Price = instrument.price(date);
  const units: number = amount / price;
  const position1 = new Position(instrument, amount, price, units, date, 1);
  portfolio.add(position1);
  const value = portfolio.value(date);
  assertAlmostEquals(value, amount);

  const position2 = new Position(instrument, amount, price, units, date, 2);
  portfolio.add(position2);
  const value2 = portfolio.value(date);
  assertAlmostEquals(value2, amount * 2);
});

Deno.test("Statement", () => {
  const portfolio = new Portfolio();
  const amount: Amount = 100;
  const position: Position = makePosition(amount);

  portfolio.add(position);
  portfolio.add(position);

  const printable = portfolio.toString(position.instrument.end);
  // console.log(printable);
  assertGreater(printable.length, 0);
});
