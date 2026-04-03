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
  }

  /** Price at tick */
  public price(tick: Tick): number {
    if (tick < this.start || tick > this.end) {
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

  constructor(
    /** List of instruments */
    public readonly instruments: Instrument[],
  ) {
    this.start = Math.min(...instruments.map((i) => i.start));
    this.end = Math.max(...instruments.map((i) => i.end));
  }

  /** All instruments available at tick */
  public on(tick: Tick): Market {
    return new Market(
      this.instruments.filter((i) => i.start <= tick && i.end >= tick),
    );
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
  market: Market,
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
    for (
      const position of this.positions.filter((p) =>
        p.instrument.end < this.tick
      )
    ) this.expire(position);
  }

  /** Process orders from strategy */
  private trade(): void {
    const instruments: Market = this.market.on(this.tick);
    const orders: Array<Order> = this.strategy(
      this.tick,
      this.saldo,
      instruments,
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
