/** An instrument tradeable on exchange */
export interface Instrument {
  // Name of instrument
  readonly symbol: string;

  // First time when chart data is available
  readonly start: Date;

  // Last time when chart data is available
  readonly end: Date;

  // Does instrument have price information at time
  active: (time: Date) => boolean;

  // Price of instrument at time
  price: (time: Date) => number;
}

/** A list of instruments */
export type Instruments = Array<Instrument>;
