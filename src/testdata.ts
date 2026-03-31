/** Generate data for testing */

import { randn } from "@sauber/statistics";
import type {
  CloseOrders,
  Price,
  PurchaseOrders,
  Strategy,
  StrategyContext,
} from "./types.ts";
import { Position, type PositionID, type Positions } from "./position.ts";
import { Exchange } from "./exchange.ts";
import type { Series, Instrument, Instruments } from "./instrument.ts";
import { createTestInstrument } from "./testinstrument.ts";

// Create array from callback
function repeat<T>(callback: () => T, count: number): Array<T> {
  return Array.from(Array(count).keys().map(callback));
}

/** Pick a random item from an array, or zero if array is empty */
function any<T>(items: Array<T>): [] | [T] {
  const count = items.length;
  if (count < 1) return [];
  const index = Math.floor(Math.random() * count);
  return [items[index]];
}

/** A list of random instruments */
export function makeInstruments(count: number): Instruments {
  return repeat<Instrument>(() => createTestInstrument(), count);
}

// Generate a position
export function makePosition(amount: number): Position {
  const instr: Instrument = createTestInstrument();
  const price = instr.price(instr.start);
  const units = amount / price;
  const id: PositionID = Math.floor(Math.random() * 1024 ** 3);
  const position = new Position(instr, amount, price, units, instr.start, id);
  return position;
}

/** A list of random instruments */
export function makePositions(count: number, amount: number): Positions {
  return repeat<Position>(() => makePosition(amount / count), count);
}

/** Maybe buy a positions, maybe close a position */
export class MaybeStrategy implements Strategy {
  constructor(private readonly probability: number = 0.5) {}

  public close(context: StrategyContext): CloseOrders {
    return Math.random() < this.probability ? any(context.closeorders) : [];
  }

  public open(context: StrategyContext): PurchaseOrders {
    return Math.random() < this.probability ? any(context.purchaseorders) : [];
  }
}

/** Create an exchange with a number of instruments availabel */
export function makeExchange(count: number): Exchange {
  return new Exchange(makeInstruments(count));
}

/** Generate a series of numbers for chart */
export function makeSeries(count: number): Series {
  const chart: number[] = [];
  let price: Price = 1000 * Math.random();
  for (let i = 0; i < count; i++) {
    const change = (randn() - 0.5) / 5; // +/- 2.5%
    price *= 1 + change;
    chart.push(parseFloat(price.toFixed(4)));
  }
  return new Float32Array(chart);
}
