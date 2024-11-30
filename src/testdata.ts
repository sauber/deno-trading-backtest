/** Generate data for testing */

import { nanoid } from "npm:nanoid@^5.0.9";
import { randn } from "@sauber/statistics";
import type {
  Bar,
  Price,
  PurchaseOrders,
  Strategy,
  StrategyContext,
} from "./types.ts";
import { Position, type PositionID, type Positions } from "./position.ts";
import { Exchange } from "./exchange.ts";
import { Instrument, type Instruments } from "./instrument.ts";

type Prices = Array<Price>;

/** Generate a random price chart */
function makeChart(count: number): Prices {
  const series: Prices = Array(count);
  let price = 1000 * Math.random();
  for (let i = 0; i < count; i++) {
    const change = (randn() - 0.5) / 5; // +/- 2.5%
    price *= 1 + change;
    series[i] = parseFloat(price.toFixed(4));
  }
  return series;
}

/** Make up a business name from an acronym */
function makeName(symbol: string): string {
  const text = `
Actions Administration Administrators Aeronautics Agency Allen American
Amyotrophic Another Art Arthur Artists Association Atlantic Atomic
Banking Bavarian Bean Best Better Block Bradley Broadcast Broadcasting
Bullough Bureau Business Childrens Christian Civil Committee Community
Commuter Company Conference Consultants Consumer Cooking Corporation
Cosmetics Council Countries Countrys Crime Day Defense Development
Direct Disabled Displacement Educational Efforts Elderly Electric
Emergency Employees Energy Entertainment Environmental Equipment
Expandable Experimental Exporting Federal Foam Foundation Fridays Fund
God Government Ham Hands Head Health Health Heart Henry Hierarchical
Home Hongkong Housing Institute Insurance Internal International Its
James Java Jelly Jet Juicy Jura Just Karen Kat Key Kidz Kind King Kit
Kwik Lansing Lateral League Legal Leon Leonwood Liberties Machines
Makeup Management Manufacturing Marketing Mars Mauritz Mens Meyer
Mining Minnesota Minority Motor Murries National Nations Network North
Occupational Officious Olympic Oracle Organization Parcel Persons
Petroleum Police Pork Product Programming Protection Prototype Public
Quay Queen Quest Quick Recreational Revenue Richard Rifle Safety School
Sclerosis Service Shanghai Shoulder Space Sports Spray Standardization
States Stores Swift Technicians Telegraph Telephone Thank Thomas
Tomorrow Transport Transportation Treaty Union United Urban Value Water
Wildlife Works World Wrestling Wright Writers Xero Xtra Yet Yogurt
Yoshida Young Zac Zag Zebra Zero Zig Zimmer Zip
  `;

  const d: Record<string, Set<string>> = {};
  const words = text.match(/\b(\w+)\b/g)?.sort() as string[];
  for (const word of words) {
    const letter: string = word.charAt(0).toUpperCase();
    if (!(letter in d)) d[letter] = new Set();
    d[letter].add(word);
  }

  const name = symbol
    .split("")
    .filter((char) => char.toUpperCase() != char.toLowerCase())
    .map((char) => {
      const s: Set<string> = d[char.toUpperCase()];
      const words = Array.from(s);
      const index = Math.floor(words.length * Math.random());
      const word = words[index];
      // console.log(char, s, index, word);
      return word;
    })
    .join(" ");

  return name;
}

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
  const length: number = Math.floor(Math.random() * 1400);
  const end: Bar = Math.floor(Math.random() * 150);
  const series: Prices = makeChart(length);
  const symbol: string = nanoid(4);
  const name: string = makeName(symbol);
  return new Instrument(series, end, symbol, name);
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
