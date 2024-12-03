/** Generate data for testing */

import type { PurchaseOrders, Strategy, StrategyContext } from "./types.ts";
import { Position, type PositionID, type Positions } from "./position.ts";
import { Exchange } from "./exchange.ts";
import type { Instrument, Instruments } from "./instrument.ts";
import { TestInstrument } from "./testinstrument.ts";

// Create array from callback
function repeat<T>(callback: () => T, count: number): Array<T> {
  return Array.from(Array(count).keys().map(callback));
}

/** Pick a random item from an array */
function any<T>(items: Array<T>): Array<T> {
  const count = items.length;
  if (count < 1) return [];
  const index = Math.floor(Math.random() * count);
  return [items[index]];
}

/** Generate an instrument */
export function makeInstrument(): Instrument {
  return new TestInstrument(1400);
}

/** A list of random instruments */
export function makeInstruments(count: number): Instruments {
  return repeat(makeInstrument, count);
}

// Generate a position
export function makePosition(amount: number): Position {
  const instr: Instrument = makeInstrument();
  const price = instr.price(instr.start);
  const units = amount / price;
  const id: PositionID = Math.floor(Math.random() * 1024 ** 3);
  const position = new Position(instr, amount, price, units, instr.start, id);
  return position;
}

/** A list of random instruments */
export function makePositions(count: number, amount: number): Positions {
  return repeat(() => makePosition(amount / count), count);
}

/** Maybe buy a positions, maybe close a position */
export class MaybeStrategy implements Strategy {
  constructor(private readonly probability: number = 0.5) {}

  public open(context: StrategyContext): PurchaseOrders {
    if (Math.random() > this.probability) return [];

    return any(context.instruments).map((instrument) => ({
      instrument,
      amount: context.amount / 10,
    }));
  }

  public close(context: StrategyContext): Positions {
    if (Math.random() > this.probability) return [];
    return any(context.positions);
  }
}

/** Create an exchange with a number of instruments availabel */
export function makeExchange(count: number): Exchange {
  return new Exchange(makeInstruments(count));
}
