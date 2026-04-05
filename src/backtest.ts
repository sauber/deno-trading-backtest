/** Amount of money */
export type Amount = number;

/** Index of series */
export type Tick = number;

/** Price series */
export type Series = Float32Array;

/** A tradable instrument */
export class Instrument {
  /** Last tick of series */
  public readonly end: Tick;

  /** First value of series */
  public readonly first: number;

  /** Last value of series */
  public readonly last: number;

  /** Count of ticks in series */
  public readonly length: number;

  constructor(
    /** Price series */
    public readonly series: Series,
    /** First tick of series */
    public readonly start: Tick,
    /** Symbol of instrument */
    public readonly symbol: string,
    /** Name of instrument (optional) */
    public readonly name?: string,
  ) {
    this.end = start + series.length - 1;
    this.first = series[0];
    this.last = series[series.length - 1];
    this.length = series.length;
  }

  /** Confirm if data is available at tick */
  public has(tick: Tick): boolean {
    return tick >= this.start && tick <= this.end;
  }

  /** Price at tick */
  public price(tick: Tick): number {
    if (!this.has(tick)) {
      throw new Error(
        `Error: Price requested for instrument ${this.symbol} at tick ${tick} is outside range [${this.start};${this.end}].`,
      );
    }
    return this.series[tick - this.start];
  }
}

/** Instruments available for trading */
export class Market {
  /** First tick of instruments */
  public readonly start: Tick;

  /** Last tick of instruments */
  public readonly end: Tick;

  /** Count if ticks in market */
  public readonly length: number;

  /** Cache of available instruments per tick */
  private readonly _cache: Instrument[][];

  constructor(public readonly instruments: Instrument[]) {
    // Optimized min/max calculation to avoid large temporary arrays and spread operator overhead
    let min = instruments.length > 0 ? instruments[0].start : 0;
    let max = instruments.length > 0 ? instruments[0].end : 0;
    for (let i = 1; i < instruments.length; i++) {
      const inst = instruments[i];
      if (inst.start < min) min = inst.start;
      if (inst.end > max) max = inst.end;
    }

    this.start = min;
    this.end = max;
    this.length = this.end - this.start + 1;

    // Pre-calculate available instruments for every simulation tick
    this._cache = new Array(this.end + 1);
    for (let t = this.start; t <= this.end; t++) {
      const available: Instrument[] = [];
      for (let i = 0; i < instruments.length; i++) {
        if (instruments[i].has(t)) available.push(instruments[i]);
      }
      this._cache[t] = available;
    }
  }

  /** All instruments available at tick */
  public on(tick: Tick): Instrument[] {
    return this._cache[tick] || [];
  }
}

/** Position opened  */
export type OpenPosition = {
  instrument: Instrument;
  quantity: number;
  start: Tick;
  invested: Amount;
};

/** Reason for closing position */
export type ClosingReason = "Close" | "Expire" | "Loss" | "Profit" | "Take";

/** Position no longer open */
export type ClosedPosition = OpenPosition & {
  reason: ClosingReason;
  end: Tick;
  profit: Amount;
};

/** Open or closed Position */
export type Position = OpenPosition | ClosedPosition;

/** List of open positions */
export type Portfolio = Array<OpenPosition>;

/** History of positions opened of closed*/
export type Transactions = Array<Position>;

/** Order to buy Position in Instrument */
export type BuyOrder = {
  instrument: Instrument;
  amount: Amount;
};

/** Order to sell Position */
export type SellOrder = {
  position: Position;
  reason: ClosingReason;
};

/** Buy or Sell Order */
export type Order = BuyOrder | SellOrder;

/** Generate list of trading Orders */
export type Strategy = (
  /** Tick to execute strategy */
  tick: Tick,
  /** Amount of available cash */
  cash: Amount,
  /** Available instruments at tick */
  instruments: Instrument[],
  /** Current open positions */
  portfolio: Portfolio,
) => Array<Order>;

/** Run simulation using strategy */
export class Backtest {
  /** Series of available cash */
  public readonly cash: Series;

  /** Series of value of positions */
  public readonly invested: Series;

  /** Series of total value of account */
  public readonly value: Series;

  /** Open Positions */
  public readonly positions: Portfolio = [];

  /** History of transactions */
  public readonly transactions: Transactions = [];

  private tick: Tick = 0;
  private saldo: Amount = 0;

  constructor(
    /** Instruments available for simulation */
    private readonly market: Market,
    /** Strategy for buying and selling */
    private readonly strategy: Strategy,
    /** Initial amount of cash available for investing */
    private readonly amount: Amount,
    /** Percentage fee for buying */
    private readonly buy_commission: number,
    /** Percentage fee for selling */
    private readonly sell_commission: number,
  ) {
    const length: number = market.end - market.start + 1;
    this.cash = new Float32Array(length);
    this.invested = new Float32Array(length);
    this.value = new Float32Array(length);
    this.saldo = amount;
  }

  /** Open new position */
  private open(order: BuyOrder): void {
    if (order.amount > this.saldo) return;
    const position: OpenPosition = {
      instrument: order.instrument,
      quantity: order.amount / order.instrument.price(this.tick) *
        (1 - this.buy_commission),
      start: this.tick,
      invested: order.amount,
    };
    this.positions.push(position);
    this.saldo -= order.amount;
  }

  /** Close existing position */
  private close(order: SellOrder, price: Amount): void {
    const value: Amount = order.position.quantity * price;
    const amount: Amount = value * (1 - this.sell_commission);
    const profit = amount - order.position.invested;
    this.positions.splice(this.positions.indexOf(order.position), 1);
    const end: Tick = this.tick;
    const position: OpenPosition = order.position;
    const reason: ClosingReason = order.reason;
    const closed: ClosedPosition = { ...position, reason, end, profit };
    this.transactions.push(closed);
    this.saldo += amount;
  }

  /** Expire position */
  private expire(position: Position): void {
    const price: Amount = position.instrument.price(this.tick - 1);
    this.close({ position, reason: "Expire" }, price);
  }

  /** Close positions where price data is no longer available */
  private liquidation(): void {
    // Iterating backwards to safely handle removal during loop without .filter allocation
    for (let i = this.positions.length - 1; i >= 0; i--) {
      if (this.positions[i].instrument.end < this.tick) {
        this.expire(this.positions[i]);
      }
    }
  }

  /** Process orders from strategy */
  private trade(): void {
    const available = this.market.on(this.tick);
    const orders: Array<Order> = this.strategy(
      this.tick,
      this.saldo,
      available,
      this.positions,
    );
    for (const order of orders) {
      if ("instrument" in order) this.open(order);
      else this.close(order, order.position.instrument.price(this.tick));
    }
  }

  /** Update price series at end of each tick */
  private valuation(): void {
    const index = this.tick - this.market.start;
    this.cash[index] = this.saldo;
    this.invested[index] = this.positions.map((p) =>
      p.quantity *
      p.instrument.price(this.tick)
    ).reduce((a, b) => a + b, 0);
    this.value[index] = this.cash[index] + this.invested[index];
  }

  /** Execute actions for each tick */
  private step(tick: Tick): void {
    this.tick = tick;
    this.liquidation();
    this.trade();
    this.valuation();
  }

  /** Run simulation */
  public run(): void {
    for (let tick = this.market.start; tick <= this.market.end; ++tick) {
      this.step(tick);
    }
  }
}
