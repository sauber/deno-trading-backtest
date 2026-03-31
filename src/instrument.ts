import { plot } from "asciichart";
import { downsample } from "@sauber/statistics";
import type { Bar, Price, Symbol } from "./types.ts";

export type Series = Float32Array;

/**
 * Instrument with price series.
 * Values are sorted from oldest to newest.
 * Bar index indicates the age.
 * "end" is newest bar index, and "start" is oldest.
 * For example if end is bar index 0, then bar index 1 is the prior value.
 */
export class Instrument {
  /** Bar Index of last item in array, more old entry */
  public readonly start: Bar;

  /** Oldest value in chart */
  public readonly first: Price;

  /** Newest value in chart */
  public readonly last: Price;

  /** Count of bars in chart */
  public readonly length: number;

  /**
   * @param series - prices from start to end
   * @param end - Index of last bar in price series
   * @param symbol - Short name of instrument
   * @param name - Long name of instrument
   */
  constructor(
    public readonly series: Series,
    public readonly end: Bar = 0,
    public readonly symbol: Symbol = "",
    public readonly name: string = "",
  ) {
    this.start = this.end + this.series.length - 1;
    this.first = this.series[0];
    this.last = this.series[this.series.length - 1];
    this.length = this.series.length;
  }

  /** Confirm if data is available at bar index */
  public has(bar: Bar): boolean {
    return bar >= this.end && bar <= this.start;
  }

  // Convert bar to array index
  private barToIndex(bar: Bar): number {
    return this.series.length - bar + this.end - 1;
  }

  /** Look up value at bar index */
  public price(bar: Bar): Price {
    if (!this.has(bar)) {
      throw new Error(
        `Bar index ${bar} is outside range ${this.start}->${this.end}.`,
      );
    }
    const index = this.barToIndex(bar);
    return this.series[index];
  }

  /** Printable Ascii Chart */
  public plot(width: number = 78, height: number = 15): string {
    const max = Math.max(
      ...this.series.map((v) => v.toFixed(2).length),
    );
    const values = downsample(Array.from(this.series), width - max - 2);
    const padding = " ".repeat(max);
    const chart = plot(values, { height: height - 1, padding });
    if (this.symbol || this.name) {
      const header = `[ ${this.symbol ?? ""} - ${this.name ?? ""}]`;
      return [header, chart].join("\n");
    }
    return chart;
  }

  /** A slice of the price series, start and end inclusive */
  public slice(start: Bar, end: Bar): Instrument {
    // Confirm data is available
    if (!this.has(start)) throw new Error(`Start bar ${start} is invalid`);
    if (!this.has(end)) throw new Error(`End bar ${end} is invalid`);

    // Translate start and end bars to array indeces
    const start_index: number = this.barToIndex(start);
    const end_index: number = this.barToIndex(end);

    // Exctract slice from price series
    const slice: Series = this.series.slice(start_index, end_index + 1);

    // Append range to name
    const name = this.name + (this.name.length > 0 ? " " : "") +
      `[${start}:${end}]`;

    // Create modified instrument
    return new Instrument(slice, end, this.symbol, name);
  }
}

/** A list of instruments */
export type Instruments = Array<Instrument>;
