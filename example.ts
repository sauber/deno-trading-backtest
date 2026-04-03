import {
  type Account,
  type Exchange,
  type Market,
  Simulation,
  type Strategy,
} from "./mod.ts";
import { makeExchange, makeMarket, MaybeStrategy } from "./src/testdata.ts";

// Create Market and Exchange
const market: Market = makeMarket(3);
const exchange: Exchange = makeExchange();

// Create Strategy
const strategy: Strategy = new MaybeStrategy(0.05);

// Run Simulation
const simulation = new Simulation(market, exchange, strategy);
simulation.run();
const account: Account = simulation.account;

// Print list of transaction, positions and performance stats
console.log(account.toString());
console.log(account.portfolio.toString(market.end));
console.log(account.plot(60, 10));
console.log(
  `Performance. Profit: ${
    (account.profit * 100).toFixed(2)
  }% Trades: ${account.trades.length} WinRatio: ${
    account.WinRatioTrades.toFixed(2)
  }`,
);
