import type { Amount, Bar, Price } from "./types.ts";
import type { Instrument } from "./instrument.ts";
import { Position, type PositionID } from "./position.ts";
import { Account } from "./account.ts";

/** An exchange responsible for collection commission when buying and selling instruments */
export class Exchange {
  /** Uniq ID for each position */
  private id: PositionID = 0;

  constructor(
    private readonly spread: number = 0,
    private readonly fee: number = 0,
  ) {
  }

  /** Create account on exchange, optional deposit and start bar */
  public createAccount(deposit: Amount = 0, start: Bar = 0): Account {
    return new Account(this, deposit, start);
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
}
