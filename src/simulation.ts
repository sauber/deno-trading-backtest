import type { Account } from "./account.ts";
import type { Exchange } from "./exchange.ts";
import type { Position } from "./position.ts";
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
    protected readonly exchange: Exchange,
    protected readonly strategy: Strategy,
    deposit: number = 10000,
  ) {
    this.account = exchange.createAccount(deposit, exchange.start);
  }

  /** Generate a list of close orders for all open positions */
  protected makeCloseOrders(): CloseOrders {
    return this.account.positions.map((position: Position) => ({
      position,
      confidence: 1,
      reason: "Close",
    }));
  }

  /** Generate a list of purchase orders for all instruments available at Bar */
  protected makePurchaseOrders(bar: Bar): PurchaseOrders {
    const instruments: Instruments = this.exchange.on(bar);
    const po: PurchaseOrders = Array<PurchaseOrder>(instruments.length);
    for (let i = 0; i < instruments.length; i++) {
      po[i] = { instrument: instruments[i], amount: 1 };
    }
    return po;
  }

  /** Gather data for context */
  protected makeContext(bar: Bar): StrategyContext {
    const context: StrategyContext = {
      amount: this.account.balance,
      value: this.account.value(bar),
      bar,
      purchaseorders: this.makePurchaseOrders(bar),
      positions: this.account.positions,
      closeorders: this.makeCloseOrders(),
    };
    return context;
  }

  /** Buy all positions advised by strategy */
  protected buy(context: StrategyContext): void {
    const orders: PurchaseOrders = this.strategy.open(context);
    for (const order of orders) {
      this.account.add(order.instrument, order.amount, context.bar);
    }
  }

  /** Sell all positions advised by strategy */
  protected sell(context: StrategyContext): void {
    const orders: CloseOrders = this.strategy.close(context);
    for (const order of orders) {
      this.account.remove(order.position, context.bar, order.reason);
    }
  }

  /** Perform one step of simulation */
  protected step(bar: Bar): void {
    const context: StrategyContext = this.makeContext(bar);
    this.buy(context);
    this.sell(context);
  }

  /** Run steps of simulation from start to end */
  public run(): void {
    for (let bar = this.exchange.start; bar >= this.exchange.end; --bar) {
      this.step(bar);
    }
  }
}
