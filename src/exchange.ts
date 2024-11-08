import type { Instrument } from "./types.ts";
import { TestInstrument } from "./testdata.ts";
import { Position } from "./position.ts";

/** An exchange of random instruments */
export class Exchange {
  constructor(
    private readonly spread: number = 0,
    private readonly fee: number = 0
  ) {}

  /** A random instrument */
  public any(): TestInstrument {
    return new TestInstrument();
  }

  /** Create a position amount of instrument. Amount is subtracted fee and spread. */
  public buy(
    instrument: Instrument,
    amount: number,
    time: Date = new Date()
  ): Position {
    const marketPrice: number = instrument.price(time);
    const exchangePrice: number = marketPrice * (1 + this.spread);
    const fee = amount * this.fee;
    const purchaseAmount = amount - fee;
    const units = purchaseAmount / exchangePrice;
    return new Position(instrument, units, exchangePrice);
  }

  /** Sell position for a fee at spread lower than price */
  public sell(position: Position, time: Date = new Date()): number {
    const value: number = position.value(time);
    const amount = value * (1 - this.spread);
    const fee = amount * this.fee;
    return amount - fee;
  }
}
