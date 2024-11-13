import type { Instrument } from "./types.ts";

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
    public readonly price: number
  ) {}

  /** Original amount invested */
  public get invested(): number {
    return this.units * this.price;
  }

  /** Value of investment at time */
  public value(time: Date = new Date()): number {
    return this.units * this.instrument.price(time);
  }

  /** Profit of investment at time */
  public profit(time: Date = new Date()): number {
    return this.value(time) - this.invested;
  }
}
