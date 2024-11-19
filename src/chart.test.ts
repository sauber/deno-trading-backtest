import { assertEquals, assertInstanceOf, assertThrows } from "@std/assert";
import { Chart, Returns, SharpeRatio } from "./chart.ts";

Deno.test("Instance", () => {
  assertInstanceOf(new Chart(), Chart);
});

Deno.test("Start/end", () => {
  const c = new Chart();
  assertEquals(c.start, -1);
  assertEquals(c.end, 0);
});

Deno.test("Bar", () => {
  const c = new Chart([0, 1]);
  assertEquals(c.bar(0), 1);
  assertEquals(c.bar(1), 0);
  assertThrows(() => c.bar(2));
});

Deno.test("Values", () => {
  const c = new Chart([0, 1]);
  assertEquals(c.values, [0, 1]);
});

Deno.test("Offset", () => {
  const c = new Chart([0, 1, 2], 5);
  assertEquals(c.start, 7);
  assertEquals(c.end, 5);
  assertEquals(c.bar(7), 0);
  assertEquals(c.bar(6), 1);
  assertEquals(c.bar(5), 2);
});

Deno.test("Add value", () => {
  const c = new Chart([0, 1], 5);
  c.add(2);
  assertEquals(c.end, 4);
});

Deno.test("Returns", () => {
  const c = new Chart([0, 1, 2], 3);
  const r = Returns(c);
  assertEquals(r.values, [1, 1]);
  assertEquals(r.end, 3);
});

Deno.test("SharpeRatio", () => {
  // Positive sharperatio
  const p: Chart = new Chart([0, 1, 3]);
  const psr: number = SharpeRatio(p);
  assertEquals(psr, 3);

  // Negative sharperatio
  const n = new Chart([3, 1, 0], 3);
  const nsr = SharpeRatio(n);
  assertEquals(nsr, -0.75);
});