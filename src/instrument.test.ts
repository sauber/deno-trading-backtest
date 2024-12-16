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
  assertEquals(instr.active(0), true);
  assertEquals(instr.active(1), true);
  assertEquals(instr.active(2), false);
});
