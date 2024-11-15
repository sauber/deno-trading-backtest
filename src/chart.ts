import type { Index, Price } from "./types.ts";

/**
 * Series of numbers
 * End is index of most recent value, usually 0
 * Start is index of oldest value and higher than end
 * */
export class Chart {
  public readonly start: Index;

  constructor(
    public readonly series: Price[] = [],
    readonly end: Index = 0
  ) {
    this.start = this.end + this.series.length - 1;
  }

  /** Confirm if data is available at index */
  public has(index: Index): boolean {
    return index >= this.end && index <= this.start;
  }

  /** Look up value at index */
  public val(index: Index): Price {
    if (this.has(index)) return this.series[index-this.end];
    throw new Error(
      `Chart index ${index} is outside range ${this.start}->${this.end}.`
    );
  }
}
