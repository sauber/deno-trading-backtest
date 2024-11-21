import { Simulation } from "./mod.ts";
import type { Exchange } from "./src/exchange.ts";
import type { Stats } from "./src/stats.ts";
import { makeExchange, TestStrategy } from "./src/testdata.ts";

const exchange: Exchange = makeExchange(5);
const simulation = new Simulation(exchange, new TestStrategy());
simulation.run();
console.log(simulation.account.statement);
console.log(simulation.account.portfolio.statement(exchange.end));
const stats: Stats = simulation.stats;
console.log(`Performance. Profit: ${(stats.profit*100).toFixed(2)}% Trades: ${stats.trades.length} Omega Ratio: ${stats.omegaRatio.toFixed(2)}`)
