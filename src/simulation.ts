import type { Account } from "./account.ts";
import type { Exchange } from "./exchange.ts";
import type { Positions } from "./position.ts";
import type {
  Bar,
  PurchaseOrders,
  Strategy,
  StrategyContext,
} from "./types.ts";

// type Performance = {
//   steps: number;
//   buys: number;
//   sells: number;
// };

export class Simulation {
  public readonly account: Account;

  constructor(
    private readonly exchange: Exchange,
    private readonly strategy: Strategy,
    private deposit: number = 10000,
  ) {
    this.account = exchange.createAccount(deposit, exchange.start);
  }

  /** Buy all positions advised by strategy */
  private buy(bar: Bar): void {
    // Check if funds are available
    const amount = this.account.balance;
    if (amount < 1) return;

    const today: StrategyContext = {
      amount,
      bar,
      instruments: this.exchange.on(bar),
      positions: this.account.positions,
    };

    const orders: PurchaseOrders = this.strategy.open(today);

    for (const order of orders) {
      const position = this.exchange.buy(order.instrument, order.amount, bar);
      this.account.add(position, order.amount, bar);
      // ++this.performance.buys;
    }
  }

  /** Sell all positions advised by strategy */
  private sell(bar: Bar): void {
    const today: StrategyContext = {
      amount: this.account.balance,
      bar,
      instruments: this.exchange.on(bar),
      positions: this.account.positions,
    };

    const positions: Positions = this.strategy.close(today);

    for (const position of positions) {
      const amount = this.exchange.sell(position, bar);
      this.account.remove(position, amount, bar);
      // ++this.performance.sells;
    }
  }

  /** Perform one step of simulation */
  private step(bar: Bar): void {
    this.sell(bar);
    this.buy(bar);
    // ++this.performance.steps;
  }

  /** Run steps of simulation from start to end */
  public run(): void {
    let bar: Bar = this.exchange.start;
    while (bar >= this.exchange.end) this.step(bar--);
  }
}
