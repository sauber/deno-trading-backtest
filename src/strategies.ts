import type {
  Amount,
  BuyOrder,
  Market,
  OpenPosition,
  Order,
  Portfolio,
  SellOrder,
  Strategy,
  Tick,
} from "./backtest.ts";

// A collection of sample strategies

// Calculate sum of value of positions
const value = (positions: Portfolio, tick: Tick): number =>
  positions.map((p) => p.quantity * p.instrument.price(tick)).reduce(
    (a, b) => a + b,
    0,
  );

/** A strategy to rebalance positions in instrument to target percentages of total value.
 * For example { Gold: 40, Silver: 40 }
 * The strategy will initially open 40 positions of each instruments each with 1% of available cash.
 * If the total value of all open posistion for an instruments
 * exceeds the target percentage by more than 1%, then positions will be closed one by one,
 * until total value is less than target+1.
 * Ditto if the total value is 1% below target value, then additional positions will be opened
 * with 1% of total account value until value of positions is above target-1;
 */
export function rebalance(targets: Record<string, number>): Strategy {
  return (
    tick: Tick,
    cash: Amount,
    market: Market,
    portfolio: Portfolio,
  ) => {
    const orders: Order[] = [];
    // Total value of account
    const total_value = cash + value(portfolio, tick);

    Object.entries(targets).forEach(([symbol, target]) => {
      const positions = portfolio.filter((p) => p.instrument.symbol === symbol);
      // Total amount invested in target
      const invested: Amount = value(positions, tick);
      let pct_invested = invested / total_value * 100;

      // Buy additional positions
      if (pct_invested < (target - 1)) {
        const instrument = market.instruments.find((i) => i.symbol === symbol);
        if (instrument) {
          const count = Math.floor(target - invested / total_value * 100);
          const amount = total_value / 100;

          for (let i = 0; i < count; i++) {
            orders.push({ instrument, amount } as BuyOrder);
          }
        }
      }

      // Sell excessive positions
      let index = 0;
      while (pct_invested > target + 1) {
        const position = positions[index];
        orders.push({ position, reason: "Close" } as SellOrder);
        index++;
        pct_invested -= position.quantity * position.instrument.price(tick) /
          total_value * 100;
      }
    });

    return orders;
  };
}

export const doNothing: Strategy = () => [];

export const randomTrading: Strategy = (
  tick: Tick,
  cash: Amount,
  market: Market,
  portfolio: Portfolio,
) => {
  const orders: Order[] = [];

  // 20% chance of closing a position
  if (portfolio.length > 0 && Math.random() < 0.2) {
    const position = portfolio[Math.floor(Math.random() * portfolio.length)];
    orders.push({
      position,
      reason: "Close",
    } as SellOrder);
  }

  // 20% chance of opening a position
  if (Math.random() < 0.2) {
    const instrument =
      market.instruments[Math.floor(Math.random() * market.instruments.length)];
    // Value of portfolio
    const equity: Amount = portfolio.map((p: OpenPosition) =>
      p.quantity * p.instrument.price(tick)
    ).reduce((a, b) => a + b, 0);

    const total = equity + cash;
    // Spend 10% of total value in each new position
    const amount = total / 10;
    orders.push({
      instrument,
      amount,
    } as BuyOrder);
  }

  return orders;
};
