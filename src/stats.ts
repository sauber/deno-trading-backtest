import { avg } from "@sauber/statistics";
import type { Account, Trades } from "./account.ts";
import type { Chart, Series } from "./chart.ts";

/** Calculate trading performance from an account */
export class Stats {
  constructor(private readonly account: Account) {}

  /** Count of bars from start to end */
  public get bars(): number {
    return this.account.start - this.account.end +1;
  }

  /** List of completed trades */
  public get trades(): Trades {
    return this.account.trades;
  }

  /** End result as ratio of start amount */
  public get profit(): number {
    const val: Series = this.account.valuation;
    return val[val.length-1] / val[0] - 1;
  }

  /** Total of gains vs total of all movement */
  public get WinRatio(): number {
    const val: Series = this.account.valuation;
    let [gain, move] = [0, 0];
    for (let i = 0; i < val.length - 1; i++) {
      const diff = val[i + 1] - val[i];
      move += Math.abs(diff);
      if (diff >= 0) gain += diff;
    }
    if (move === 0) return 0;
    return gain / move;
  }

  /** On average, of total value how much is invested */
  public get InvestedRatio(): number {
    const value: Array<number> = this.account.valuation;
    const equity: Array<number> = this.account.equity;
    const ratios: Array<number> = Array(value.length);
    for (let i = 0; i < value.length; i++) ratios[i] = equity[i] / value[i];
    const r = avg(ratios);
    return r;
  }
}
