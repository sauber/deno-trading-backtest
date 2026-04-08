import type { Instrument } from "./instrument.ts";
import type { Tick } from "./series.ts";

/** Amount of money */
export type Amount = number;

/** Position opened  */
export class OpenPosition {
  constructor(
    public readonly instrument: Instrument,
    public readonly start: Tick,
    public readonly invested: Amount,
    public readonly quantity: number,
  ) {}

  /** Value of position at tick */
  public value(tick: Tick): Amount {
    return this.quantity * this.instrument.price(tick);
  }

  /** Close position */
  public close(
    tick: Tick,
    reason: ClosingReason,
    profit: Amount,
  ): ClosedPosition {
    return new ClosedPosition(
      this.instrument,
      this.start,
      this.invested,
      this.quantity,
      tick,
      reason,
      profit,
    );
  }
}

/** Reason for closing position */
export type ClosingReason =
  | "Close"
  | "Expire"
  | "Loss"
  | "Profit"
  | "Take"
  | "Stop"
  | "Trail";

/** Position no longer open */
export class ClosedPosition {
  constructor(
    public readonly instrument: Instrument,
    public readonly start: Tick,
    public readonly invested: Amount,
    public readonly quantity: number,
    public readonly end: Tick,
    public readonly reason: ClosingReason,
    public readonly profit: Amount,
  ) {}
}

/** Open or closed Position */
export type Position = OpenPosition | ClosedPosition;

/** List of open positions */
export class Portfolio {
  constructor(public readonly positions: OpenPosition[] = []) {}

  /** Add positions to portfolio */
  public add(position: OpenPosition): void {
    this.positions.push(position);
  }

  /** Remove positions from portfolio */
  public remove(position: OpenPosition): void {
    this.positions.splice(this.positions.indexOf(position), 1);
  }

  /** Value of all positions */
  public value(tick: Tick): Amount {
    return this.positions.map((p) => p.value(tick)).reduce((a, b) => a + b, 0);
  }
}
