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

/** Generate new chart of returns as ratio of input */
export function Returns(chart: Chart): Chart {
  const input = chart.values;
  const output = Array(input.length - 1);
  for (let i = 0; i < output.length; i++) {
    output[i] = (input[i + 1] - input[i]) / input[i];
  }
  return new Chart(output, chart.end);
}

/** Calculate ratio of total of gains vs total of losses */
export function OmegaRatio(chart: Chart): number {
  let [gain, loss] = [0, 0];
  const series = chart.series;
  for (let i = 0; i < series.length - 1; i++) {
    const diff = series[i + 1] - series[i];
    if (diff > 0) gain += diff;
    else if (diff <= 0) loss -= diff;
  }
  return gain / loss;
}
