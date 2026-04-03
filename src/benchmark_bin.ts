import type { Market } from "./market.ts";
import type { Exchange } from "./exchange.ts";
import { Simulation } from "./simulation.ts";
import { makeExchange, makeMarket, MaybeStrategy } from "./testdata.ts";
import type { Strategy } from "./types.ts";

// Create Market and Exchange
const market: Market = makeMarket(500);
const exchange: Exchange = makeExchange();

// Create Strategy
const strategy: Strategy = new MaybeStrategy(1);

// Run Simulation many times
for (let i = 0; i < 1000; i++) {
  const simulation = new Simulation(market, exchange, strategy);
  simulation.run();
  const _winratio = simulation.account.WinRatio;
}
