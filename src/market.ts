import type { Instrument } from "./instrument.ts";
import type { Tick } from "./series.ts";

export class Market {
  /** First tick of instruments */
  public readonly start: Tick;

  /** Last tick of instruments */
  public readonly end: Tick;

  /** Count if ticks in market */
  public readonly length: number;

  /** Cache of available instruments per tick */
  private readonly _cache: Instrument[][];

  constructor(public readonly instruments: Instrument[]) {
    // Optimized min/max calculation to avoid large temporary arrays and spread operator overhead
    let min = instruments.length > 0 ? instruments[0].start : 0;
    let max = instruments.length > 0 ? instruments[0].end : 0;
    for (let i = 1; i < instruments.length; i++) {
      const inst = instruments[i];
      if (inst.start < min) min = inst.start;
      if (inst.end > max) max = inst.end;
    }

    this.start = min;
    this.end = max;
    this.length = this.end - this.start + 1;

    // Pre-calculate available instruments for every simulation tick
    this._cache = new Array(this.end + 1);
    for (let t = this.start; t <= this.end; t++) {
      const available: Instrument[] = [];
      for (let i = 0; i < instruments.length; i++) {
        if (instruments[i].has(t)) available.push(instruments[i]);
      }
      this._cache[t] = available;
    }
  }

  /** All instruments available at tick */
  public on(tick: Tick): Instrument[] {
    return this._cache[tick] || [];
  }
}
