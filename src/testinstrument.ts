/** Generate data for testing */
import { nanoid } from "nanoid";
import { type Series, Instrument } from "./instrument.ts";
import type { Bar } from "./types.ts";
import { makeSeries } from "./testdata.ts";

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

/** An instrument with a random symbol, series and name
 * @param length - Count of bars in series
 */
export function createTestInstrument(length: number = 730): Instrument {
  const symbol: string = makeSymbol();
  const name: string = makeName(symbol);
  const series: Series = makeSeries(length);
  const end: Bar = Math.floor(Math.random() * length / 5);
  return new Instrument(series, end, symbol, name);
}
