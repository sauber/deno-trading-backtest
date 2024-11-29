import type { Amount, Bar, Instrument, PositionID, Price } from "./types.ts";

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
    public readonly id: PositionID,
  ) {}

  /** Original amount invested */
  public get invested(): Amount {
    return this.amount;
  }

  /** Value of investment at bar */
  public value(bar: Bar = 0): Amount {
    return this.units * this.instrument.price(bar);
  }

  /** Represent position data as string */
  public print(): string {
    return `${this.instrument.symbol}/${
      this.amount.toFixed(2)
    } [${this.instrument.start}-${this.start}-${this.instrument.end}]`;
  }
}
