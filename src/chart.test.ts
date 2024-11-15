import { assertEquals, assertInstanceOf, assertThrows } from "@std/assert";
import { Chart } from "./chart.ts";

Deno.test("Instance", () => {
  assertInstanceOf(new Chart(), Chart);
});

Deno.test("Start/end", () => {
  const c = new Chart();
  assertEquals(c.start, 0);
  assertEquals(c.end, -1);
});

Deno.test("Values", () => {
  const c = new Chart([0, 1]);
  assertEquals(c.val(0), 0);
  assertEquals(c.val(1), 1);
  assertThrows(() => c.val(2));
});
