import { assertEquals, assertInstanceOf, assertThrows } from "@std/assert";
import { type Buffer, Chart } from "./chart.ts";
import { makeBuffer } from "./testdata.ts";

const buf = (v: number[] = []): Buffer => new Float32Array(v);

Deno.test("Instance", () => {
  assertInstanceOf(new Chart(buf()), Chart);
});

Deno.test("Start/end", () => {
  const c = new Chart(buf());
  assertEquals(c.start, -1);
  assertEquals(c.end, 0);
});

Deno.test("Bar", () => {
  const c = new Chart(buf([0, 1]));
  assertEquals(c.bar(0), 1);
  assertEquals(c.bar(1), 0);
  assertThrows(() => c.bar(2));
});

Deno.test("Values", () => {
  const c = new Chart(buf([0, 1]));
  assertEquals(c.values, buf([0, 1]));
});

Deno.test("Offset", () => {
  const c = new Chart(buf([0, 1, 2]), 5);
  assertEquals(c.start, 7);
  assertEquals(c.end, 5);
  assertEquals(c.bar(7), 0);
  assertEquals(c.bar(6), 1);
  assertEquals(c.bar(5), 2);
});

Deno.test("Plot graph", { ignore: true }, () => {
  const buffer: Buffer = makeBuffer(1000);
  const c = new Chart(buffer, 5);
  const width = 20;
  const height = 10;
  const printable: string = c.plot(width, height);
  const lines: string[] = printable.split("\n");
  assertEquals(lines.length, height);
  assertEquals(lines[0].length, width);
  console.log(printable);
});
