import {
  type Account,
  type Exchange,
  Simulation,
  type Strategy,
} from "./mod.ts";
import { makeExchange, MaybeStrategy } from "./src/testdata.ts";

// Create an Exchange with a numebr instruments available
const exchange: Exchange = makeExchange(3);

// Create Strategy
const strategy: Strategy = new MaybeStrategy(0.05);

// Run Simulation
const simulation = new Simulation(exchange, strategy);
simulation.run();
const account: Account = simulation.account;

// Print list of transaction, positions and performance stats
console.log(account.toString());
console.log(account.portfolio.toString(exchange.end));
console.log(account.plot(60, 10));
console.log(
  `Performance. Profit: ${
    (account.profit * 100).toFixed(2)
  }% Trades: ${account.trades.length} WinRatio: ${account.WinRatio.toFixed(2)}`,
);
