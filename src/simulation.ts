import { Account } from "./account.ts";
import { Exchange } from "./exchange.ts";
import type { Market } from "./market.ts";
import type { Positions } from "./position.ts";
import { Strategy } from "./strategy.ts";
import type { Index, PurchaseOrders } from "./types.ts";

type Performance = {
  steps: number;
  buys: number;
  sells: number;
};

export class Simulation {
  public readonly performance: Performance = { steps: 0, buys: 0, sells: 0 };
  public readonly account: Account;
  private readonly exchange = new Exchange();

  constructor(
    private readonly market: Market,
    private readonly strategy: Strategy,
    private deposit: number = 10000
  ) {
    this.account = new Account(deposit, this.market.start);
  }

  /** Buy all positions advised by strategy */
  private buy(index: Index, strategy: Strategy): void {
    const orders: PurchaseOrders = strategy.buy();
    for (const order of orders) {
      const position = this.exchange.buy(order.instrument, order.amount, index);
      this.account.add(position, order.amount, index);
      ++this.performance.buys;
    }
  }

  /** Sell all positions advised by strategy */
  private sell(index: Index, strategy: Strategy): void {
    const positions: Positions = strategy.sell();
    for (const position of positions) {
      const amount = this.exchange.sell(position, index);
      this.account.remove(position, amount, index);
      ++this.performance.sells;
    }
  }

  /** Perform one step of simulation */
  private step(index: Index): void {
    // console.log("step:", { index });
    const today: Strategy = new Strategy({
      instruments: this.market.on(index),
    }).append(this.strategy);
    this.sell(index, today);
    this.buy(index, today);
    ++this.performance.steps;
  }

  /** Run steps of simulation from start to end */
  public run(): void {
    let index: Index = this.market.start;
    while (index >= this.market.end) {
      this.step(index--);
    }
  }
}
