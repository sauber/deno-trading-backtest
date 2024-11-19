/** Generate data for testing */
import type {
  Instrument,
  Bar,
  Price,
  Instruments,
  Strategy,
  PurchaseOrders,
  StrategyContext,
} from "./types.ts";
import { nanoid } from "nanoid";
import { plot } from "asciichart";
import { downsample, randn } from "@sauber/statistics";
import { Position, type Positions } from "./position.ts";
import { Chart } from "./chart.ts";

/** Generate a random chart */
function randomChart(count: number): Chart {
  const chart: number[] = [];
  let price = 1000 * Math.random();
  for (let i = 0; i < count; i++) {
    const change = (randn() - 0.5) / 5; // +/- 2.5%
    price *= 1 + change;
    chart.push(parseFloat(price.toFixed(4)));
  }
  return new Chart(chart);
}

/** Make up a business name from an acronym */
function makeName(symbol: string): string {
  const text = `Head Heart Hands 
American Consultants League Civil Liberties Union Association for 
Commuter Transportation Amyotrophic Lateral Sclerosis Writers and 
Artists Institute Better Business Bureau Council of Actions United 
Service Efforts Conference of Minority Public Administrators Direct 
Marketing Educational Foundation United States Environmental Protection 
Agency Federal Emergency Management Home School Legal Defense Housing 
and Urban Development International Atomic Energy Crime Police 
Organization Olympic Committee Internal Revenue Service Standardization
National of Broadcast Employees Technicians National Aeronautics Space 
Administration North Atlantic Treaty National Rifle of the Petroleum 
Exporting Countries Occupational Safety Health Transport Elderly 
Disabled Persons United Nations Childrens Fund World Health World 
Wildlife Young Mens Christian The Minnesota Mining Manufacturing 
Company Allen Wright Telephone Telegraph Bavarian Motor Works Bradley 
Voorhees Day Consumer Value Stores Government Insurance Sports 
Programming Network Experimental Prototype Community of Tomorrow Henry 
Richard Block Mauritz Hongkong Shanghai Banking Corporation
Machines James Bullough Lansing Leon Leonwood Bean Mars Murries Makeup 
Art Cosmetics National Broadcasting Cooking Spray Product of Arthur 
Meyer Non-Expandable Recreational Foam Recreational Equipment Shoulder 
of Pork Ham Thomas Swift Electric Rifle The Countrys Best Yogurt Thank 
God Its Fridays United Parcel Service Water Displacement formula World 
Wrestling Entertainment Yet Another Hierarchical Officious Oracle 
Yoshida Manufacturing Kit Kat Kind King Karen Kidz Key Kwik Quick Quay 
Queen Quest Xero Xtra Zebra Zimmer Zero Zip Zig Zag Zac Java Jelly Just 
Jet Jura Juicy
  `;

  const d: Record<string, Set<string>> = {};
  const sorted = text.match(/\b(\w+)\b/g)?.sort() as string[];
  for (const word of sorted) {
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

/** An instrument with a random symbol and random price */
export class TestInstrument implements Instrument {
  public readonly symbol: string = nanoid(4).toUpperCase();
  public readonly name: string = makeName(this.symbol);
  private readonly length: number = 700;
  private readonly chart: Chart = randomChart(this.length);
  public readonly end: Bar = 0;
  public readonly start: Bar = this.length - 1;

  /** Random price with 10% of base price */
  public price(bar: Bar): Price {
    return this.chart.bar(bar);
  }

  /** Active if within  */
  public active(bar: Bar): boolean {
    return this.chart.has(bar);
  }

  /** Printable Ascii Chart */
  public plot(height: number = 15, width: number = 78): string {
    height -= 2;
    const price = this.chart.series.slice().reverse();
    const chart = downsample(price, width - 7);
    const padding = "       ";
    return (
      `[ ${this.symbol} - ${this.name}]\n` + plot(chart, { height, padding })
    );
  }
}

// Generate an instrument
export function makeInstrument(): Instrument {
  return new TestInstrument();
}

// Generate a position
export function makePosition(amount: number): Position {
  const instr: Instrument = makeInstrument();
  const price = instr.price(instr.start);
  const position = new Position(instr, amount / price, price);
  return position;
}

// Create array from callback
function repeat<T>(callback: () => T, count: number): Array<T> {
  return Array.from(Array(count).keys().map(callback));
}

/** A list of random instruments */
export function makeInstruments(count: number): Instruments {
  return repeat(makeInstrument, count);
}

/** A list of random instruments */
export function makePositions(count: number, amount: number): Positions {
  return repeat(() => makePosition(amount / count), count);
}

/** Pick a random item from an array */
function any<T>(items: Array<T>): Array<T> {
  const count = items.length;
  if (count < 1) return [];
  const index = Math.floor(Math.random() * count);
  return [items[index]];
}

/** Maybe true, may false */
function maybe(): boolean {
  return Math.random() < 0.5;
}

/** Maybe buy a positions, maybe close a position */
export class TestStrategy implements Strategy {
  public open(context: StrategyContext): PurchaseOrders {
    if (maybe()) return [];

    return any(context.instruments).map((instrument) => ({
      instrument,
      amount: context.amount / 10,
    }));
  }

  public close(context: StrategyContext): Positions {
    if (maybe()) return [];
    return any(context.positions);
  }
}
