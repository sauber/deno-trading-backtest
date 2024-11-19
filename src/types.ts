import type { Positions } from "./position.ts";

/** Bar index in chart */
export type Index = number;

/** An amount of cash */
export type Amount = number;

/** A price of an instrument at a time */
export type Price = number;

/** An instrument tradeable on exchange */
export type Instrument = {
  // Name of instrument
  readonly symbol: string;

  // Last time when chart data is available, usually 0
  readonly end: Index;

  // First time when chart data is available, number higher that start
  readonly start: Index;

  // Does instrument have price information at time
  active: (index: Index) => boolean;

  // Price of instrument at time
  price: (index: Index) => Price;
};

/** A list of instruments */
export type Instruments = Array<Instrument>;

/** Purchase Order; an amount of fractional count of instrument */
export type PurchaseOrder = {
  readonly instrument: Instrument;
  readonly amount: Amount;
};

/** A list of Purchase orders */
export type PurchaseOrders = Array<PurchaseOrder>;

/** Data availble for strategies to make suggestions */
export type StrategyContext = {
  /** Bar index in chart */
  index: Index;

  /** Target amount for new positions */
  amount: Amount;

  /** Instruments available at index */
  instruments: Instruments;

  /** Current open positions */
  positions: Positions;
};

/** Strategy to suggest positions to open and close */
export type Strategy = {
  // Generate list of positions to open
  open: (context: StrategyContext) => PurchaseOrders;

  // Generate list of positions to close
  close: (context: StrategyContext) => Positions;
}
