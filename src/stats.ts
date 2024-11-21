import type { Account } from "./account.ts";
import { SharpeRatio, type Chart } from "./chart.ts";

/** Calculate trading performance from an account */
export class Stats {
  constructor(private readonly account: Account) {}

  /** Count of from start to end */
  public get bars(): number {
    const chart: Chart = this.account.valuation;
    return chart.start - chart.end + 1;
  }

  public get sharperatio(): number {
    return SharpeRatio(this.account.valuation);
  }
}
