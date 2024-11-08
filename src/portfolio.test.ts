import {
  assertEquals,
  assertGreater,
  assertInstanceOf,
  assertLess,
  assertNotEquals,
} from "@std/assert";
import { Portfolio } from "./portfolio.ts";
import type { Position } from "./position.ts";
import { makePosition } from "./testdata.ts";

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

Deno.test("Profit", () => {
  const portfolio = new Portfolio();
  const amount = 100;
  portfolio.add(makePosition(amount));
  portfolio.add(makePosition(amount));
  assertNotEquals(portfolio.profit(), 0);
});

Deno.test("Value", () => {
  const portfolio = new Portfolio();
  const amount = 100;
  portfolio.add(makePosition(amount));
  portfolio.add(makePosition(amount));
  const value = portfolio.value();
  assertGreater(value, 1.6 * amount);
  assertLess(value, 2.4 * amount);
});

Deno.test("Statement", () => {
  const portfolio = new Portfolio();
  const amount = 100;
  portfolio.add(makePosition(amount));
  portfolio.add(makePosition(amount));

  const printable = portfolio.statement;
  assertGreater(printable.length, 0);
});
