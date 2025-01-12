import type { Account } from "./account.ts";
import type { Exchange } from "./exchange.ts";
import type { Position, Positions } from "./position.ts";
import type { Instruments } from "./instrument.ts";
import type {
  Bar,
  CloseOrders,
  PurchaseOrder,
  PurchaseOrders,
  Strategy,
  StrategyContext,
} from "./types.ts";

export class Simulation {
  public readonly account: Account;

  constructor(
    private readonly exchange: Exchange,
    private readonly strategy: Strategy,
    deposit: number = 10000,
  ) {
    this.account = exchange.createAccount(deposit, exchange.start);
  }

  /** Expire all positions no longer having data at bar */
  private expire(bar: Bar): void {
    const available: Instruments = this.exchange.on(bar);
    const positions: Positions = this.account.positions;
    const prev: Bar = bar + 1;
    for (let i = 0; i < positions.length; i++) {
      const position = positions[i];
      if (!available.includes(position.instrument)) {
        this.account.remove(position, prev);
      }
    }
  }

  /** Generate a list of close orders for all open positions */
  private makeCloseOrders(): CloseOrders {
    return this.account.positions.map((position: Position) => ({
      position,
      confidence: 1,
    }));
  }

  /** Generate a list of purchase orders for all instruments available at Bar */
  private makePurchaseOrders(bar: Bar): PurchaseOrders {
    const instruments: Instruments = this.exchange.on(bar);
    const po: PurchaseOrders = Array<PurchaseOrder>(instruments.length);
    for (let i = 0; i < instruments.length; i++) {
      po[i] = { instrument: instruments[i], amount: 1 };
    }
    return po;
  }

  /** Gather data for context */
  private makeContext(bar: Bar): StrategyContext {
    const context: StrategyContext = {
      amount: this.account.balance,
      value: this.account.value(bar),
      bar,
      purchaseorders: this.makePurchaseOrders(bar),
      closeorders: this.makeCloseOrders(),
    };
    return context;
  }

  /** Buy all positions advised by strategy */
  private buy(context: StrategyContext): void {
    const orders: PurchaseOrders = this.strategy.open(context);
    for (let i = 0; i < orders.length; i++) {
      this.account.add(orders[i].instrument, orders[i].amount, context.bar);
    }
  }

  /** Sell all positions advised by strategy */
  private sell(context: StrategyContext): void {
    const orders: CloseOrders = this.strategy.close(context);
    for (let i = 0; i < orders.length; i++) {
      this.account.remove(orders[i].position, context.bar);
    }
  }

  /** Perform one step of simulation */
  private step(bar: Bar): void {
    this.expire(bar);
    const context: StrategyContext = this.makeContext(bar);
    this.sell(context);
    this.buy(context);
  }

  /** Run steps of simulation from start to end */
  public run(): void {
    for (let bar = this.exchange.start; bar >= this.exchange.end; --bar) {
      this.step(bar);
    }
  }
}
