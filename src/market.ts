import type { Bar, Symbol } from "./types.ts";
import type { Instrument, Instruments } from "./instrument.ts";

/** Handles the list of instruments and availability on a given bar */
export class Market {
  /** The oldest chart bar index */
  public readonly start: Bar;

  /** The most recent chart bar index */
  public readonly end: Bar;

  /** Cache of instruments available on each bar */
  private readonly barInstruments: Array<Instruments>;

  constructor(private readonly instruments: Instruments) {
    this.start = Math.max(...instruments.map((i) => i.start));
    this.end = Math.min(...instruments.map((i) => i.end));
    this.barInstruments = Array(this.start + 1);
  }

  /** A random instrument */
  public any(): Instrument {
    return this
      .instruments[Math.floor(Math.random() * this.instruments.length)];
  }

  /** Instruments available at bar */
  public on(bar: Bar): Instruments {
    if (!this.barInstruments[bar]) {
      this.barInstruments[bar] = this.instruments.filter((i) => i.has(bar));
    }
    return this.barInstruments[bar];
  }

  /** Get instrument by symbol */
  public get(symbol: Symbol): Instrument | undefined {
    return this.instruments.find((i) => i.symbol === symbol);
  }
}
