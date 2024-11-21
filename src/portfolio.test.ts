import {
  assertAlmostEquals,
  assertEquals,
  assertGreater,
  assertInstanceOf,
} from "@std/assert";
import { Portfolio } from "./portfolio.ts";
import type { Position } from "./position.ts";
import { makePosition } from "./testdata.ts";
import type { Amount } from "./types.ts";

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
  const position: Position = makePosition(amount);
  portfolio.add(position);
  const value = portfolio.value(position.instrument.start);
  assertAlmostEquals(value, amount);
  portfolio.add(position);
  const value2 = portfolio.value(position.instrument.start);
  assertAlmostEquals(value2, amount * 2);
});

Deno.test("Statement", () => {
  const portfolio = new Portfolio();
  const amount: Amount = 100;
  const position: Position = makePosition(amount);

  portfolio.add(position);
  portfolio.add(position);

  const printable = portfolio.statement(position.instrument.end);
  // console.log(printable);
  assertGreater(printable.length, 0);
});
