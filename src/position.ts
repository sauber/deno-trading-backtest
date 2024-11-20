import type { Amount, Bar, Instrument, Price } from "./types.ts";

export type Positions = Array<Position>;

export class Position {
  /**
   * @param instrument - Instrument of investment
   * @param amount - Price of position including fees
   * @param price - Purchase price of one instrument unit
   * @param units - Count of units of instrument
   * @param start - Bar index of opening
   */
  constructor(
    public readonly instrument: Instrument,
    public readonly amount: Amount,
    public readonly price: Price,
    public readonly units: number,
    public readonly start: Bar,
  ) {}

  /** Original amount invested */
  public get invested(): Amount {
    return this.amount;
  }

  /** Value of investment at bar */
  public value(bar: Bar = 0): Amount {
    return this.units * this.instrument.price(bar);
  }

  /** Profit of investment at time */
  // public profit(index: Bar = 0): Amount {
  //   return this.value(index) - this.invested;
  // }
}
