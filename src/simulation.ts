import { Account } from "./account.ts";
import type { Market } from "./market.ts";
import type { Positions } from "./position.ts";
import { Strategy } from "./strategy.ts";
import type { Index } from "./types.ts";

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
    const positions: Positions = strategy.sell();
    for (const position of positions) {
      this.account.add(position, position.invested);
      ++this.performance.buys;
    }
  }

  /** Perform one step of simulation */
  private step(index: Index): void {
    // console.log("step:", { index });
    const today: Strategy = new Strategy({
      instruments: this.market.on(index),
    }).append(this.strategy);
    this.buy(today);
    ++this.performance.steps;
  }

  /** Run steps of simulation from start to end */
  public run(): void {
    let index: Index = this.market.start;
    // console.log("Simulation run start index:", index);
    // this.step(index);
    while (index >= this.market.end) {
      this.step(index--);
      // --index;
    }
  }
}
