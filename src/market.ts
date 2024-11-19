import type { Index, Instruments } from "./types.ts";

/** A collection of instruments */
export class Market {
  /** The most recent chart index */
  public readonly start: Index;
  /** The oldest chart index */
  public readonly end: Index;

  constructor(private readonly instruments: Instruments) {
    this.end = Math.min(...instruments.map((i) => i.end));
    this.start = Math.max(...instruments.map((i) => i.start));
  }

  /** Instruments available on date */
  public on(index: Index = 0): Instruments {
    return this.instruments.filter((i) => i.active(index));
  }
}
