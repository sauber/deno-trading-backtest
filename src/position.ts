import type { Instrument } from "./instrument.ts";
import type { Tick } from "./series.ts";

/** Amount of money */
export type Amount = number;

/** Instruments available for trading */

/** Position opened  */
export class OpenPosition {
  constructor(
    public readonly instrument: Instrument,
    public readonly quantity: number,
    public readonly start: Tick,
    public readonly invested: Amount,
  ) {}

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
      this.quantity,
      this.start,
      this.invested,
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
export class ClosedPosition extends OpenPosition {
  constructor(
    instrument: Instrument,
    quantity: number,
    start: Tick,
    invested: Amount,
    public readonly end: Tick,
    public readonly reason: ClosingReason,
    public readonly profit: Amount,
  ) {
    super(instrument, quantity, start, invested);
  }
}

/** Open or closed Position */
export type Position = OpenPosition | ClosedPosition;

/** List of open positions */
export type Portfolio = Array<OpenPosition>;
