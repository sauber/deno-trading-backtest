import type { Exchange } from "./exchange.ts";
import { Simulation } from "./simulation.ts";
import type { Stats } from "./stats.ts";
import { makeExchange, TestStrategy } from "./testdata.ts";
import type { Strategy } from "./types.ts";

// Create an Exchange with a numebr instruments available
const exchange: Exchange = makeExchange(500);

// Create Strategy
const strategy: Strategy = new TestStrategy(1);

// Run Simulation many times
for (let i = 0; i < 10000; i++) {
  const simulation = new Simulation(exchange, strategy);
  simulation.run();
  const stats: Stats = simulation.stats;
  const winratio = stats.WinRatio;
  // console.log(winratio);
}
