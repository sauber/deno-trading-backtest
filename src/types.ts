export interface Instrument {
  // Name of instrument
  symbol: string;

  // First time when chart data is available
  start: Date;

  // Last time when chart data is available
  end: Date;

  // Does instrument have price information at time
  active: (time: Date) => boolean;

  // Price of instrument at time
  price: (time: Date) => number;
}
