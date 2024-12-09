import { Simulation, type Strategy, type Exchange, type Stats } from "./mod.ts";
import { makeExchange, MaybeStrategy } from "./src/testdata.ts";

// Create an Exchange with a numebr instruments available
const exchange: Exchange = makeExchange(3);

// Create Strategy
const strategy: Strategy = new MaybeStrategy();

// Run Simulation
const simulation = new Simulation(exchange, strategy);
simulation.run();
const stats: Stats = simulation.stats;

// Print list of transaction, positions and performance stats
console.log(simulation.account.toString);
console.log(simulation.account.portfolio.toString(exchange.end));
console.log(simulation.account.plot(10));
console.log(`Performance. Profit: ${(stats.profit*100).toFixed(2)}% Trades: ${stats.trades.length} WinRatio: ${stats.WinRatio.toFixed(2)}`)
