import type { Amount, Index, Instrument, Price } from "./types.ts";
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
    index: Index = 0
  ): Position {
    const marketPrice: Price = instrument.price(index);
    const exchangePrice: Price = marketPrice * (1 + this.spread);
    const fee: Amount = amount * this.fee;
    const purchaseAmount: Amount = amount - fee;
    const units = purchaseAmount / exchangePrice;
    // console.log({marketPrice, exchangePrice, fee, purchaseAmount, units});
    return new Position(instrument, units, exchangePrice);
  }

  /** Sell position for a fee at spread lower than price */
  public sell(position: Position, index: Index = 0): Amount {
    const value: Amount = position.value(index);
    const amount: Amount = value * (1 - this.spread);
    const fee: Amount = amount * this.fee;
    return amount - fee;
  }
}
