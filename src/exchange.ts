import type { Amount, Bar, Instrument, Instruments, Price } from "./types.ts";
import { Position } from "./position.ts";
import { Account } from "./account.ts";

/** An exchange where accounts can aquire or release positions in instruments for a fee */
export class Exchange {
  /** The oldest chart bar index */
  public readonly start: Bar;
  /** The most recent chart bar index */
  public readonly end: Bar;

  constructor(
    private readonly instruments: Instruments,
    private readonly spread: number = 0,
    private readonly fee: number = 0,
  ) {
    this.start = Math.max(...instruments.map((i) => i.start));
    this.end = Math.min(...instruments.map((i) => i.end));
  }

  /** Create account on exchange, optional deposit and start bar */
  public createAccount(deposit: Amount = 0, start: Bar = 0): Account {
    return new Account(this, deposit, start);
  }

  public any(): Instrument {
    return this.instruments[Math.floor(Math.random()*this.instruments.length)];
  }

  /** Instruments available at bar */
  public on(bar: Bar): Instruments {
    return this.instruments.filter((i) => i.active(bar));
  }

  /** Create a position amount of instrument. Amount is subtracted fee and spread. */
  public buy(
    instrument: Instrument,
    amount: number,
    index: Bar = 0,
  ): Position {
    const marketPrice: Price = instrument.price(index);
    const exchangePrice: Price = marketPrice * (1 + this.spread);
    const fee: Amount = amount * this.fee;
    const purchaseAmount: Amount = amount - fee;
    const units = purchaseAmount / exchangePrice;
    return new Position(instrument, amount, exchangePrice, units, index);
  }

  /** Sell position for a fee at spread lower than price */
  public sell(position: Position, index: Bar = 0): Amount {
    const value: Amount = position.value(index);
    const amount: Amount = value * (1 - this.spread);
    const fee: Amount = amount * this.fee;
    return amount - fee;
  }
}
