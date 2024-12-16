import { plot } from "asciichart";
import { downsample } from "@sauber/statistics";
import type { Bar, Price, Symbol } from "./types.ts";
import type { Buffer } from "./chart.ts";

/** Symbol and price series
 * Values are sorted from oldest to newest.
 * Bar index indicates the age.
 * "end" is newest bar index, and "start" is oldest.
 * For example if end is bar index 0, then bar index 1 is the prior value.
 */
export class Instrument {
  /** Bar Index of first item in array, ie oldest entry */
  public readonly start: Bar;

  /** Oldest value in chart */
  public readonly first: Price;

  /** Newest value in chart */
  public readonly last: Price;

  /** Count of bars in chart */
  public readonly length: number;

  /**
   * @param series - prices from start to end
   * @param end - Index of last bar in chart
   * @param symbol - Short name of instrument
   * @param name - Full name of instrument
   */
  constructor(
    public readonly buffer: Buffer,
    public readonly end: Bar,
    public readonly symbol: Symbol,
    public readonly name?: string,
  ) {
    this.start = this.end + this.buffer.length - 1;
    this.first = this.buffer[0];
    this.last = this.buffer[this.buffer.length - 1];
    this.length = this.buffer.length;
  }

  /** Active if bar within series range */
  public active(bar: Bar): boolean {
    return bar >= this.end && bar <= this.start;
  }

  /** Random price with 10% of base price */
  public price(bar: Bar): Price {
    if (!this.active(bar)) {
      throw new Error(
        `Bar index ${bar} is outside range ${this.start}->${this.end}.`,
      );
    }

    const index = this.buffer.length - bar + this.end - 1;
    return this.buffer[index];
  }

  /** Printable Ascii Chart */
  public plot(height: number = 15, width: number = 78): string {
    height -= 2;
    const max = Math.max(
      ...[this.buffer[0], this.buffer[this.buffer.length - 1]].map((v) =>
        v.toFixed(2).length
      ),
    );
    const values = downsample(Array.from(this.buffer), width - max);
    const padding = " ".repeat(max);
    return (
      `[ ${this.symbol} - ${this.name}]\n` + plot(values, { height, padding })
    );
  }
}

/** A list of instruments */
export type Instruments = Array<Instrument>;
