import type { Amount, Bar, Price, Symbol } from "./types.ts";
import type { Instrument, Instruments } from "./instrument.ts";
import { Position, type PositionID } from "./position.ts";
import { Account } from "./account.ts";

/** An exchange where accounts can aquire or release positions in instruments for a fee */
export class Exchange {
  /** The oldest chart bar index */
  public readonly start: Bar;

  /** The most recent chart bar index */
  public readonly end: Bar;

  /** Cache of instruments available on each bar */
  private readonly barInstruments: Array<Instruments>;

  /** Uniq ID ofr each position */
  private id: PositionID = 0;

  constructor(
    private readonly instruments: Instruments,
    private readonly spread: number = 0,
    private readonly fee: number = 0,
  ) {
    this.start = Math.max(...instruments.map((i) => i.start));
    this.end = Math.min(...instruments.map((i) => i.end));
    this.barInstruments = Array(this.start);
  }

  /** Create account on exchange, optional deposit and start bar */
  public createAccount(deposit: Amount = 0, start: Bar = 0): Account {
    return new Account(this, deposit, start);
  }

  public any(): Instrument {
    return this
      .instruments[Math.floor(Math.random() * this.instruments.length)];
  }

  /** Instruments available at bar */
  public on(bar: Bar): Instruments {
    if (!this.barInstruments[bar]) {
      this.barInstruments[bar] = this.instruments.filter((i) => i.has(bar));
    }
    return this.barInstruments[bar];
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
    return new Position(
      instrument,
      amount,
      exchangePrice,
      units,
      index,
      this.id++,
    );
  }

  /** Sell position for a fee at spread lower than price */
  public sell(position: Position, index: Bar = 0): Amount {
    const value: Amount = position.value(index);
    const amount: Amount = value * (1 - this.spread);
    const fee: Amount = amount * this.fee;
    return amount - fee;
  }

  /** Get instrument by symbol */
  public get(symbol: Symbol): Instrument | undefined {
    return this.instruments.find((i) => i.symbol === symbol);
  }
}
