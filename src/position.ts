import type { Amount, Bar, Instrument, Price } from "./types.ts";

export type Positions = Array<Position>;

export class Position {
  /**
   * @param instrument - Instrument of investment
   * @param units - Count of units of instrument
   * @param price - Purchase price of one instrument unit
   */
  constructor(
    public readonly instrument: Instrument,
    public readonly units: number,
    public readonly price: Price
  ) {}

  /** Original amount invested */
  public get invested(): Amount {
    return this.units * this.price;
  }

  /** Value of investment at time */
  public value(index: Bar = 0): Amount {
    return this.units * this.instrument.price(index);
  }

  /** Profit of investment at time */
  public profit(index: Bar = 0): Amount {
    return this.value(index) - this.invested;
  }
}
