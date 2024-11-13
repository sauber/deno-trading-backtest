type Trade = {
  // Time when trade was opened
  start: Date;
  // Time when trade was closed
  end: Date;
  // Amount paid for open
  first: number;
  // Amount returned at close
  last: number;
};

type Trades = Array<Trade>;

type Saldo = {
  cash: number;
  invested: number;
  profit: number;
};

type Ticks = Array<Saldo>;

/** Combined value of all saldo items */
function value(s: Saldo): number {
  return s.cash + s.invested + s.profit;
}

/** Record activity of trading and calculate statistics */
export class Stats {
  private readonly saldolist: Ticks = [];
  private readonly tradelist: Trades = [];

  /** Record a saldo */
  public tick(b: Saldo): void {
    this.saldolist.push(b);
  }

  /** Number of records bars */
  public get ticks(): number {
    return this.saldolist.length;
  }

  /** Ratio of last to first value */
  public get profit(): number {
    if (this.saldolist.length < 2) return 0;
    return (
      value(this.saldolist[this.saldolist.length - 1]) /
        value(this.saldolist[0]) -
      1
    );
  }

  /** Record a completed trade */
  public trade(start: Date, end: Date, first: number, last: number): void {
    this.tradelist.push({ start, end, first, last });
  }

  /** Ratio of wins over losses */
  public get winratio(): undefined | number {
    let wins = 0,
      losses = 0;
    for (const trade of this.tradelist) {
      if (trade.last / trade.first > 1) ++wins;
      if (trade.last / trade.first < 1) ++losses;
    }
    if ( wins + losses < 1) return undefined;
    return wins / (wins + losses);
  }
}
