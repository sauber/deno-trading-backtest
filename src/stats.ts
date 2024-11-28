import type { Account, Trades } from "./account.ts";
import type { Chart } from "./chart.ts";

/** Calculate trading performance from an account */
export class Stats {
  constructor(private readonly account: Account) {}

  /** Count of bars from start to end */
  public get bars(): number {
    const chart: Chart = this.account.valuation;
    return chart.start - chart.end + 1;
  }

  /** List of completed trades */
  public get trades(): Trades {
    return this.account.trades;
  }

  /** End result as ratio of start amount */
  public get profit(): number {
    return this.account.valuation.last / this.account.valuation.first - 1;
  }

  /** Total of gains vs total of all movement */
  public get WinRatio(): number {
    const series: number[] = this.account.valuation.series;
    let [gain, move] = [0, 0];
    for (let i = 0; i < series.length - 1; i++) {
      const diff = series[i + 1] - series[i];
      move += Math.abs(diff);
      if (diff >= 0) gain += diff;
    }
    if ( move === 0 ) return 0;
    return gain / move;
  }
}
