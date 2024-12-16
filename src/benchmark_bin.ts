import type { Exchange } from "./exchange.ts";
import { Simulation } from "./simulation.ts";
import { makeExchange, MaybeStrategy } from "./testdata.ts";
import type { Strategy } from "./types.ts";

// Create an Exchange with a number of instruments available
const exchange: Exchange = makeExchange(500);

// Create Strategy
const strategy: Strategy = new MaybeStrategy(1);

// Run Simulation many times
for (let i = 0; i < 1000; i++) {
  const simulation = new Simulation(exchange, strategy);
  simulation.run();
}
