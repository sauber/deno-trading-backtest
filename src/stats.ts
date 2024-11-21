import type { Account, Trades } from "./account.ts";
import { type Chart, SharpeRatio } from "./chart.ts";

/** Calculate trading performance from an account */
export class Stats {
  constructor(private readonly account: Account) {}

  /** Count of bars from start to end */
  public get bars(): number {
    const chart: Chart = this.account.valuation;
    return chart.start - chart.end + 1;
  }

  /** SharpeRatio of account value */
  public get sharperatio(): number {
    return SharpeRatio(this.account.valuation);
  }

  /** List of completed trades */
  public get trades(): Trades {
    return this.account.trades;
  }

  /** End result as ratio of start amount */
  public get profit(): number {
    return this.account.valuation.last / this.account.valuation.first - 1;
  }
}
