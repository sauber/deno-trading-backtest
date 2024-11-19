import { assertEquals, assertInstanceOf } from "@std/assert";
import { Stats } from "./stats.ts";

Deno.test("Instance", () => {
  assertInstanceOf(new Stats(), Stats);
});

Deno.test("Ticks", () => {
  const s = new Stats();
  s.tick({ cash: 0, invested: 0, profit: 0 });
  assertEquals(s.ticks, 1);
  s.tick({ cash: 0, invested: 0, profit: 0 });
  assertEquals(s.ticks, 2);
});

Deno.test("Profit", () => {
  const s = new Stats();
  assertEquals(s.profit, 0);
  s.tick({ cash: 2, invested: 0, profit: 0 });
  assertEquals(s.profit, 0);
  s.tick({ cash: 4, invested: 0, profit: 0 });
  assertEquals(s.profit, 1);
});

Deno.test("Winratio", () => {
  const s = new Stats();
  assertEquals(s.winratio, undefined);
  s.trade(new Date(), new Date(), 0, 0);
  assertEquals(s.winratio, undefined);
  s.trade(new Date(), new Date(), 0, 1);
  assertEquals(s.winratio, 1);
  s.trade(new Date(), new Date(), 1, 0);
  assertEquals(s.winratio, 0.5);
});
