import type { Account } from "./account.ts";
import type { Exchange } from "./exchange.ts";
import type { Positions } from "./position.ts";
import { Stats } from "./stats.ts";
import type {
  Bar,
  Instruments,
  PurchaseOrders,
  Strategy,
  StrategyContext,
} from "./types.ts";

export class Simulation {
  public readonly account: Account;

  constructor(
    private readonly exchange: Exchange,
    private readonly strategy: Strategy,
    deposit: number = 10000,
  ) {
    this.account = exchange.createAccount(deposit, exchange.start);
  }

  /** Expire all positions no longer having data at bar */
  private expire(bar: Bar): void {
    const available: Instruments = this.exchange.on(bar);
    const expired: Positions = this.account.positions.filter((position) =>
      !available.includes(position.instrument)
    );
    for (const position of expired) this.account.remove(position, bar + 1);
  }

  /** Buy all positions advised by strategy */
  private buy(bar: Bar): void {
    // Check if funds are available
    const amount = this.account.balance;
    if (amount < 1) return;

    const today: StrategyContext = {
      amount,
      value: this.account.value(bar),
      bar,
      instruments: this.exchange.on(bar),
      positions: this.account.positions,
    };

    const orders: PurchaseOrders = this.strategy.open(today);

    for (const order of orders) {
      this.account.add(order.instrument, order.amount, bar);
    }
  }

  /** Sell all positions advised by strategy */
  private sell(bar: Bar): void {
    const today: StrategyContext = {
      amount: this.account.balance,
      value: this.account.value(bar),
      bar,
      instruments: this.exchange.on(bar),
      positions: this.account.positions,
    };

    const positions: Positions = this.strategy.close(today);

    for (const position of positions) {
      this.account.remove(position, bar);
    }
  }

  /** Perform one step of simulation */
  private step(bar: Bar): void {
    this.expire(bar);
    this.sell(bar);
    this.buy(bar);
  }

  /** Run steps of simulation from start to end */
  public run(): void {
    let bar: Bar = this.exchange.start;
    while (bar >= this.exchange.end) this.step(bar--);
    this.account.withdraw(0, this.exchange.end); // Ensure valuation until end
  }

  /** Stats from simulation */
  public get stats(): Stats {
    return new Stats(this.account);
  }
}
