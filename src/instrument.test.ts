import { assertEquals, assertThrows } from "@std/assert";
import { Instrument } from "./instrument.ts";
import type { Series, Tick } from "./series.ts";

const series: Series = new Float32Array([100, 101, 102, 103, 104]);

Deno.test("Instrument - constructor initializes properties correctly", () => {
  const start: Tick = 0 as Tick;
  const instrument = new Instrument(series, start, "ATI", "A Test Instrument");

  assertEquals(instrument.series, series);
  assertEquals(instrument.start, 0);
  assertEquals(instrument.symbol, "ATI");
  assertEquals(instrument.name, "A Test Instrument");
  assertEquals(instrument.first, 100);
  assertEquals(instrument.last, 104);
  assertEquals(instrument.length, 5);
  assertEquals(instrument.end, 4);
});

Deno.test("Instrument - has() returns true for ticks within range", () => {
  const instrument = new Instrument(series, 10 as Tick, "ATI");

  assertEquals(instrument.has(10 as Tick), true);
  assertEquals(instrument.has(12 as Tick), true);
  assertEquals(instrument.has(14 as Tick), true);
});

Deno.test("Instrument - has() returns false for ticks outside range", () => {
  const instrument = new Instrument(series, 10 as Tick, "ATI");

  assertEquals(instrument.has(9 as Tick), false);
  assertEquals(instrument.has(15 as Tick), false);
});

Deno.test("Instrument - price() returns correct value for valid tick", () => {
  const instrument = new Instrument(series, 10 as Tick, "ATI");

  assertEquals(instrument.price(10 as Tick), 100);
  assertEquals(instrument.price(12 as Tick), 102);
  assertEquals(instrument.price(14 as Tick), 104);
});

Deno.test("Instrument - price() throws error for tick outside range", () => {
  const instrument = new Instrument(series, 10 as Tick, "ATI");

  assertThrows(() => instrument.price(9 as Tick));
  assertThrows(() => instrument.price(15 as Tick));
});

Deno.test("Instrument - slice() returns correct sub-instrument", () => {
  const instrument = new Instrument(series, 10 as Tick, "ATI");

  const sliced = instrument.slice(11 as Tick, 13 as Tick);
  assertEquals(sliced.start, 11);
  assertEquals(sliced.end, 13);
  assertEquals(sliced.length, 3);
  assertEquals(sliced.first, 101);
  assertEquals(sliced.last, 103);
  assertEquals(sliced.symbol, "ATI[11;13]");
  assertEquals(sliced.name, undefined);
});

Deno.test("Instrument - slice() throws error for out-of-range slice", () => {
  const instrument = new Instrument(series, 10 as Tick, "ATI");

  assertThrows(() => instrument.slice(9 as Tick, 12 as Tick));
  assertThrows(() => instrument.slice(11 as Tick, 15 as Tick));
});

Deno.test("Instrument - slice() with default end parameter", () => {
  const instrument = new Instrument(series, 10 as Tick, "ATI");

  const sliced = instrument.slice(11 as Tick);
  assertEquals(sliced.end, 14);
  assertEquals(sliced.length, 4);
});
