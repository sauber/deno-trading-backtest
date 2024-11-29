import { Simulation, type Strategy, type Exchange, type Stats } from "./mod.ts";
import { makeExchange, TestStrategy } from "./src/testdata.ts";

// Create an Exchange with a numebr instruments available
const exchange: Exchange = makeExchange(3);

// Create Strategy
const strategy: Strategy = new TestStrategy();

// Run Simulation
const simulation = new Simulation(exchange, strategy);
simulation.run();
const stats: Stats = simulation.stats;

// Print list of transaction, positions and performance stats
console.log(simulation.account.statement);
console.log(simulation.account.portfolio.statement(exchange.end));
console.log(`Performance. Profit: ${(stats.profit*100).toFixed(2)}% Trades: ${stats.trades.length} WinRatio: ${stats.WinRatio.toFixed(2)}`)
