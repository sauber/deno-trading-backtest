import { Exchange } from "./exchange.ts";
import type { Instrument } from "./types.ts";
import { makeInstrument } from "./testdata.ts";
import type { Position } from "./position.ts";
import {
  assertAlmostEquals,
  assertGreater,
  assertInstanceOf,
  assertLess,
} from "@std/assert";

Deno.test("Instance", () => {
  const ex = new Exchange();
  assertInstanceOf(ex, Exchange);
});

Deno.test("Buy", () => {
  const time = new Date();
  const ex = new Exchange();
  const instr: Instrument = makeInstrument();
  const amount = 1000;
  const position: Position = ex.buy(instr, amount, time);
  // console.log(position);
  assertAlmostEquals(position.price * position.units, amount);
});

Deno.test("Sell", () => {
  const time = new Date();
  const ex = new Exchange();
  const instr: Instrument = makeInstrument();
  const buying = 1000;
  const position: Position = ex.buy(instr, buying, time);
  const selling = ex.sell(position, time);
  assertLess(selling / buying, 1.1 / 0.9);
  assertGreater(selling / buying, 0.9 / 1.1);
});
