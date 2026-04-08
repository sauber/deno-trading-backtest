import type { Instrument } from "./instrument.ts";
import type { Tick } from "./series.ts";

/** Amount of money */
export type Amount = number;

/** Instruments available for trading */

/** Position opened  */
export type OpenPosition = {
  instrument: Instrument;
  quantity: number;
  start: Tick;
  invested: Amount;
};

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
export type ClosedPosition = OpenPosition & {
  reason: ClosingReason;
  end: Tick;
  profit: Amount;
};

/** Open or closed Position */
export type Position = OpenPosition | ClosedPosition;

/** List of open positions */
export type Portfolio = Array<OpenPosition>;
