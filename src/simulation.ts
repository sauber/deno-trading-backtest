import { Account } from "./account.ts";
import type { Market } from "./market.ts";
import type { Portfolio } from "./portfolio.ts";
import { Strategy } from "./strategy.ts";

type Performance = {
  steps: number;
  buys: number;
};

export class Simulation {
  public readonly performance: Performance = { steps: 0, buys: 0 };
  private readonly account: Account;

  constructor(
    private readonly market: Market,
    private readonly strategy: Strategy,
    private deposit: number = 10000
  ) {
    this.account = new Account(deposit, this.market.start);
  }

  /** Buy all positions advised by strategy */
  private buy(strategy: Strategy): void {
    const positions: Portfolio = strategy.sell();
    for ( const position of positions ) {
      this.account.add(position, position.amount);
      ++this.performance.buys;
    }
  }

  /** Perform one step of simulation */
  private step(time: Date): void {
    // console.log("step:", { time });
    const today: Strategy = new Strategy({
      instruments: this.market.on(time),
    }).append(this.strategy);
    this.buy(today);
    ++this.performance.steps;
  }

  /** Run steps of simulation from start to end */
  public run(): void {
    const time = new Date(this.market.start);
    while (time <= this.market.end) {
      this.step(time);
      time.setDate(time.getDate() + 1);
    }
  }
}
