import type { Market } from "./market.ts";
import {
  type Amount,
  OpenPosition,
  type Portfolio,
  type Position,
} from "./position.ts";
import type { Series, Tick } from "./series.ts";
import type { BuyOrder, Order, SellOrder, Strategy } from "./strategy.ts";

/** History of positions opened of closed*/
export type Transactions = Array<Position>;

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
    const quantity = order.amount / order.instrument.price(this.tick) *
      (1 - this.buy_commission);
    const position = new OpenPosition(
      order.instrument,
      quantity,
      this.tick,
      order.amount,
    );
    this.positions.push(position);
    this.saldo -= order.amount;
  }

  /** Close existing position */
  private close(order: SellOrder, tick: Tick): void {
    const value: Amount = order.position.value(tick);
    const amount: Amount = value * (1 - this.sell_commission);
    const profit = amount - order.position.invested;
    this.positions.splice(this.positions.indexOf(order.position), 1);
    const closed = order.position.close(this.tick, order.reason, profit);
    this.transactions.push(closed);
    this.saldo += amount;
  }

  /** Expire position */
  private expire(position: Position): void {
    this.close({ position, reason: "Expire" }, this.tick - 1);
  }

  /** Close positions where price data is no longer available */
  private liquidation(): void {
    // Iterating backwards to safely handle removal during loop
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
      else this.close(order, this.tick);
    }
  }

  /** Update price series at end of each tick */
  private valuation(): void {
    const index = this.tick - this.market.start;
    this.cash[index] = this.saldo;
    this.invested[index] = this.positions.map((p) => p.value(this.tick)).reduce(
      (a, b) => a + b,
      0,
    );
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
