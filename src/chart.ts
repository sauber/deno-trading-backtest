import { avg, std } from "@sauber/statistics";
import type { Bar, Price } from "./types.ts";

type Series = Array<Price>;

/**
 * Series of Values
 * Values are sorted from oldest to newest.
 * Bar index indicates the age.
 * "end" is newest bar index, and "start" is oldest.
 * For example if end is bar index 0, then bar index 1 is the prior value.
 * */
export class Chart {
  /** Bar Index of last item in array, more old entry */
  public readonly start: Bar;

  constructor(
    /** Series of chart values array */
    public readonly series: Series = [],
    /** Bar index of most recent value */
    public end: Bar = 0
  ) {
    this.start = this.end + this.series.length - 1;
  }

  /** Confirm if data is available at bar index */
  public has(bar: Bar): boolean {
    return bar >= this.end && bar <= this.start;
  }

  /** Look up value at bar index */
  public bar(bar: Bar): Price {
    if (!this.has(bar))
      throw new Error(
        `Bar index ${bar} is outside range ${this.start}->${this.end}.`
      );

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

/** Generate new chart of returns from input */
export function Returns(chart: Chart): Chart {
  const input = chart.values;
  const output = Array(input.length - 1);
  for (let i = 0; i < output.length; i++) output[i] = input[i + 1] - input[i];
  return new Chart(output, chart.end);
}

/** SharpeRatio of Chart */
export function SharpeRatio(chart: Chart): number {
  const returns = Returns(chart);
  const av: number = avg(returns.values);
  const st: number = std(returns.values);
  return av > 0 ? av / st : av * st;
}
