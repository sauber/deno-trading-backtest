import type { Bar, Instruments } from "./types.ts";

/** A collection of instruments */
export class Market {
  /** The most recent chart index */
  public readonly start: Bar;
  /** The oldest chart index */
  public readonly end: Bar;

  constructor(private readonly instruments: Instruments) {
    this.end = Math.min(...instruments.map((i) => i.end));
    this.start = Math.max(...instruments.map((i) => i.start));
  }

  /** Instruments available on date */
  public on(index: Bar = 0): Instruments {
    return this.instruments.filter((i) => i.active(index));
  }
}
