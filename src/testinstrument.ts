/** Generate data for testing */

import { randn } from "@sauber/statistics";
import { nanoid } from "nanoid";
import { Instrument, Market, type Series, type Tick } from "./backtest.ts";

/** Generate a random ticker symbol */
function makeSymbol(): string {
  return nanoid(4).toUpperCase();
}

/** Make up a business name from an acronym */
function makeName(symbol: string): string {
  // Typical components of business names
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

  // Group names by first letter
  const d: Record<string, Set<string>> = {};
  const sorted = text.match(/\b(\w+)\b/g)?.sort() as string[];
  for (const word of sorted) {
    const letter: string = word.charAt(0).toUpperCase();
    if (!(letter in d)) d[letter] = new Set();
    d[letter].add(word);
  }

  // Match letters with a random word starting with same letter
  const name = symbol
    .split("")
    .filter((char) => char.toUpperCase() != char.toLowerCase())
    .map((char) => {
      const s: Set<string> = d[char.toUpperCase()];
      const words: string[] = Array.from(s);
      const index: number = Math.floor(words.length * Math.random());
      const word: string = words[index];

      return word;
    })
    .join(" ");

  return name;
}

/** Generate a series of numbers for chart */
function makeSeries(count: number): Series {
  const chart: number[] = [];
  let price = 1000 * Math.random();
  for (let i = 0; i < count; i++) {
    const change = (randn() - 0.5) / 5; // +/- 2.5%
    price *= 1 + change;
    chart.push(parseFloat(price.toFixed(4)));
  }
  return new Float32Array(chart);
}

/** An instrument with a random symbol, series and name
 * @param length - Count of bars in series, default 730
 */
export const makeInstrument = (length: number = 730): Instrument => {
  const symbol: string = makeSymbol();
  const name: string = makeName(symbol);
  const series: Series = makeSeries(length);
  const start: Tick = Math.floor(Math.random() * length / 5);
  return new Instrument(series, start, symbol, name);
};

/** Create a market with a number of instrument
 * @param count - Count of instruments
 * @param length - Count of ticks in each instrument
 */
export const makeMarket = (count: number = 3, length: number = 730): Market =>
  new Market(
    Array.from(Array(count).keys()).map(() => makeInstrument(length)),
  );
