/**
 * Series of numbers
 * Start is index of most recent value, usually 0
 * End is index of oldest value and higher than start
 * */
export class Chart {
  public readonly end: number;

  constructor(
    private readonly series: number[] = [],
    readonly start: number = 0
  ) {
    this.end = this.start + this.series.length - 1;
  }

  /** Look up value at index */
  public val(index: number): number {
    if (index < this.start || index > this.end)
      throw new Error(
        `Chart index ${index} is outside range ${this.start}-${this.end}.`
      );
    return this.series[index];
  }
}
