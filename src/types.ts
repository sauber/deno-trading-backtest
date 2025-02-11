import type { Position, Positions } from "./position.ts";
import type { Instrument } from "./instrument.ts";

/** Symbol is a string */
export type Symbol = string;

/** Bar index in chart */
export type Bar = number;

/** An amount of cash */
export type Amount = number;

/** A price of an instrument at a time */
export type Price = number;

/** Confidence in range from 0 (no confidence) to 1 (total confidence) */
export type Confidence = number;

/** Purchase Order; an amount of fractional count of instrument */
export type PurchaseOrder = {
  readonly instrument: Instrument;
  readonly amount: Amount;
};

/** A list of Purchase orders */
export type PurchaseOrders = Array<PurchaseOrder>;

export type CloseOrder = {
  readonly position: Position;
  readonly confidence: Confidence;
};

/** A list of close orders */
export type CloseOrders = Array<CloseOrder>;

/** Data availble for strategies to make suggestions */
export type StrategyContext = {
  /** Bar index in chart */
  bar: Bar;

  /** Total value of account */
  value: Amount;

  /** Target amount for new positions */
  amount: Amount;

  /** Instruments available at index */
  purchaseorders: PurchaseOrders;

  /** Current open positions */
  positions: Positions;

  /** Current open positions */
  closeorders: CloseOrders;
};

/** Strategy to suggest positions to open and close */
export type Strategy = {
  // Generate list of positions to close
  close: (context: StrategyContext) => CloseOrders;

  // Generate list of positions to open
  open: (context: StrategyContext) => PurchaseOrders;
};

/** Valid reasons for closing position */
export type Reason = "Close" | "Expire" | "Loss" | "Profit";


