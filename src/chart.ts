import { plot } from "asciichart";
import { downsample } from "@sauber/statistics";
import type { Bar, Price } from "./types.ts";

export type Buffer = Float32Array;

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

  /** Memory compacted series */
  // private readonly buffer: Buffer;

  constructor(
    /** Series of chart values array */
    private readonly buffer: Buffer,
    /** Bar index of most recent value */
    public readonly end: Bar = 0,
  ) {
    this.start = this.end + buffer.length - 1;
  }

  /** Most recent value in series */
  public get first(): Price {
    return this.buffer[0];
  }

  /** Most recent value in series */
  public get last(): Price {
    return this.buffer[this.buffer.length - 1];
  }

  /** Count of bars in chart */
  public get length(): number {
    return this.buffer.length;
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

    const index = this.buffer.length - bar + this.end - 1;
    return this.buffer[index];
  }

  /** Array of all values */
  public get values(): Buffer {
    return this.buffer;
  }

  /** Printable Ascii Chart */
  public plot(width: number = 78, height: number = 15): string {
    const max = Math.max(
      ...this.buffer.map((v) =>
        v.toFixed(2).length
      ),
    );
    const values = downsample(Array.from(this.buffer), width - max - 2);
    const padding = " ".repeat(max);
    return plot(values, { height: height - 1, padding });
  }
}
