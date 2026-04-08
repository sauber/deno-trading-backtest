import type { Series, Tick } from "./series.ts";

/** A tradable instrument */
export class Instrument {
  /** Last tick of series */
  public readonly end: Tick;

  /** First value of series */
  public readonly first: number;

  /** Last value of series */
  public readonly last: number;

  /** Count of ticks in series */
  public readonly length: number;

  constructor(
    /** Price series */
    public readonly series: Series,
    /** First tick of series */
    public readonly start: Tick,
    /** Symbol of instrument */
    public readonly symbol: string,
    /** Name of instrument (optional) */
    public readonly name?: string,
  ) {
    this.end = start + series.length - 1;
    this.first = series[0];
    this.last = series[series.length - 1];
    this.length = series.length;
  }

  /** Confirm if data is available at tick */
  public has(tick: Tick): boolean {
    return tick >= this.start && tick <= this.end;
  }

  /** Price at tick */
  public price(tick: Tick): number {
    if (!this.has(tick)) {
      throw new Error(
        `Error: Price requested for instrument ${this.symbol} at tick ${tick} is outside range [${this.start};${this.end}].`,
      );
    }
    return this.series[tick - this.start];
  }
}
