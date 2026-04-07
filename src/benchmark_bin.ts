import { Backtest, type Market, type Strategy } from "./backtest.ts";
import { randomTrading } from "./strategies.ts";
import { makeMarket } from "./testinstrument.ts";

// Create Market and Exchange
const market: Market = makeMarket(500);

// Create Strategy
const strategy: Strategy = randomTrading(0.2, 0.1);

// Run Simulation many times
for (let i = 0; i < 1000; i++) {
  const simulation = new Backtest(market, strategy, 10000, 0.001, 0.001);
  simulation.run();
  const wins = simulation.transactions.filter((t) =>
    "end" in t && t.profit > 0
  ).length;
  const losses =
    simulation.transactions.filter((t) => "end" in t && t.profit < 0).length;
  const _winratio = wins / (wins + losses);
}
