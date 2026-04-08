// A collection of sample strategies

import type { Instrument } from "./instrument.ts";
import type { Amount, OpenPosition, Portfolio } from "./position.ts";
import type { Tick } from "./series.ts";
import type { BuyOrder, Order, SellOrder, Strategy } from "./strategy.ts";

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
    instruments: Instrument[],
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
        const instrument = instruments.find((i) => i.symbol === symbol);
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

export function randomTrading(
  chance: number = 0.2,
  ratio: number = 0.1,
): Strategy {
  return (
    tick: Tick,
    cash: Amount,
    instruments: Instrument[],
    portfolio: Portfolio,
  ) => {
    const orders: Order[] = [];

    // 20% chance of closing a position
    if (portfolio.length > 0 && Math.random() < chance) {
      const position = portfolio[Math.floor(Math.random() * portfolio.length)];
      orders.push({
        position,
        reason: "Close",
      } as SellOrder);
    }

    // 20% chance of opening a position
    if (Math.random() < chance) {
      const index = Math.floor(Math.random() * instruments.length);
      const instrument = instruments[index];
      // Value of portfolio
      const equity: Amount = portfolio.map((p: OpenPosition) =>
        p.quantity * p.instrument.price(tick)
      ).reduce((a, b) => a + b, 0);

      const total = equity + cash;
      // Spend 10% of total value in each new position
      const amount = total * ratio;
      orders.push({
        instrument,
        amount,
      } as BuyOrder);
    }

    return orders;
  };
}
