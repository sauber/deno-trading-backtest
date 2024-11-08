import type { Instruments } from "./types.ts";

// Compare two dates
function sorttx(a: Date, b: Date): number {
  return b.getTime() - a.getTime();
}

/** A collection of instruments */
export class Market {
  public readonly start: Date;
  public readonly end: Date;

  constructor(private readonly instruments: Instruments) {
    this.start = instruments.map((i) => i.start).sort(sorttx)[0];
    this.end = instruments
      .map((i) => i.end)
      .sort(sorttx)
      .reverse()[0];
  }

  /** Instruments available on date */
  public on(time: Date): Instruments {
    return this.instruments.filter((i) => i.active(time));
  }
}
