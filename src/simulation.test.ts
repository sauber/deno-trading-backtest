import { assertInstanceOf } from "@std/assert";
import { Simulation } from "./simulation.ts";
import { makeExchange, TestStrategy } from "./testdata.ts";

const ex = makeExchange(3);

Deno.test("Instance", () => {
  assertInstanceOf(
    new Simulation(ex, new TestStrategy()),
    Simulation,
  );
});

Deno.test("Steps", () => {
  const s = new Simulation(ex, new TestStrategy());
  // assertEquals(s.performance.steps, 0);
  s.run();
  const days: number = ex.start - ex.end;
  // assertEquals(s.performance.steps, days + 1);
});

Deno.test("Buying and selling", () => {
  const s = new Simulation(ex, new TestStrategy());
  s.run();
  // assertGreater(s.performance.buys, 0);
  // assertGreater(s.performance.sells, 0);
});

// Deno.test("Winratio", () => {
//   const market = makeMarket(10);
//   const s = new Simulation(market, new TestStrategy());
//   s.run();
//   const winratio = s.performance.winratio;
//   assertGreater(winratio, 0);
//   assertLess(winratio, 1);
// });
