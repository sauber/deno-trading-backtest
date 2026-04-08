import type { Instrument } from "./instrument.ts";
import type {
  Amount,
  ClosingReason,
  OpenPosition,
  Portfolio,
} from "./position.ts";
import type { Tick } from "./series.ts";

/** Order to buy Position in Instrument */
export type BuyOrder = {
  instrument: Instrument;
  amount: Amount;
};

/** Order to sell Position */
export type SellOrder = {
  position: OpenPosition;
  reason: ClosingReason;
};

/** Buy or Sell Order */
export type Order = BuyOrder | SellOrder;

/** Generate list of trading Orders */
export type Strategy = (
  /** Tick to execute strategy */
  tick: Tick,
  /** Amount of available cash */
  cash: Amount,
  /** Available instruments at tick */
  instruments: Instrument[],
  /** Current open positions */
  portfolio: Portfolio,
) => Array<Order>;
