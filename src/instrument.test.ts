import { assertEquals, assertInstanceOf, assertThrows } from "@std/assert";
import { Instrument } from "./instrument.ts";

Deno.test("Instance", () => {
  assertInstanceOf(new Instrument(new Float32Array([]), 0, ""), Instrument);
});

Deno.test("Start / End", () => {
  const instr = new Instrument(new Float32Array([0, 1, 2]), 5, "");
  assertEquals(instr.start, 7);
  assertEquals(instr.end, 5);
});

Deno.test("Price", () => {
  const instr = new Instrument(new Float32Array([0, 1]), 0, "");
  assertEquals(instr.price(0), 1);
  assertEquals(instr.price(1), 0);
  assertThrows(() => instr.price(2));
});

Deno.test("Active", () => {
  const instr = new Instrument(new Float32Array([0, 1]), 0, "");
  assertEquals(instr.has(0), true);
  assertEquals(instr.has(1), true);
  assertEquals(instr.has(2), false);
});

Deno.test("Slice", () => {
  const instr = new Instrument(new Float32Array(Array(10).keys()), 0, "");
  const slice: Instrument = instr.slice(4, 2);
  assertEquals(slice.series, new Float32Array([5, 6, 7]));
  assertEquals(slice.name, "[4:2]");
  assertEquals(slice.end, 2);
  assertEquals(slice.start, 4);
  assertEquals(slice.length, 3);
});
