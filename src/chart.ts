import type { Bar, Price } from "./types.ts";

type Series = Array<Price>;

/**
 * Series of Values
 * Values are sorted from oldest to newest.
 * Bar index indicates the age.
 * "end" is newest bar index, and "start" is oldest.
 * For example if end is bar index 0, then bar index 1 is the prior value.
 */
export class Chart {
  /** Bar Index of last item in array, more old entry */
  public readonly start: Bar;

  /** Oldest value in chart */
  public readonly first: Price;

  constructor(
    /** Series of chart values array */
    public readonly series: Series = [],
    /** Bar index of most recent value */
    public end: Bar = 0,
  ) {
    this.start = this.end + this.series.length - 1;
    this.first = this.series[0];
  }

  /** Most recent value in series */
  public get last(): Price {
    return this.series[this.series.length - 1];
  }

  /** Count of bars in chart */
  public get length(): number {
    return this.series.length;
  }

  /** Confirm if data is available at bar index */
  public has(bar: Bar): boolean {
    return bar >= this.end && bar <= this.start;
  }

  /** Look up value at bar index */
  public bar(bar: Bar): Price {
    if (!this.has(bar)) {
      throw new Error(
        `Bar index ${bar} is outside range ${this.start}->${this.end}.`,
      );
    }

    const index = this.series.length - bar + this.end - 1;
    return this.series[index];
  }

  /** Extend series with value */
  public add(price: Price): void {
    this.series.push(price);
    --this.end;
  }

  /** Array of all values */
  public get values(): Series {
    return this.series;
  }
}

