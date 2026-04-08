// Backtest a rebalancing strategy

import { makeMarket } from "./src/testinstrument.ts";
import { Backtest } from "./src/backtest.ts";
import { rebalance } from "./src/strategies.ts";
import { linechart } from "jsr:@sauber/widgets";
import { Table } from "jsr:@sauber/table";

const market = makeMarket(9, 100);
const targets = Object.fromEntries(
  market.instruments.map((i) => [i.symbol, 10]),
);
const strategy = rebalance(targets);

// Run simulation
const simulation = new Backtest(market, strategy, 1000, 0, 0);
simulation.run();

// Display value of investment
const value = Array.from(simulation.value);
console.log("Investment Value");
console.log(linechart(value, 15, 72));

// Display open positions
const table = new Table();
table.headers = ["Symbol", "Open", "Value"];
table.rows = simulation.portfolio.positions.map((
  p,
) => [
  p.instrument.symbol,
  p.start,
  (p.value(market.end)).toFixed(2),
]);
table.title = "Open Positions";
console.log(table.toString());
