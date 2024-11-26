import { Table } from "@sauber/table";
import type { Position } from "./position.ts";
import type { Amount, Bar } from "./types.ts";

/** A collection of instruments */
export class Portfolio {
  /* Open a portfolio optionally with number of positions */
  constructor(public readonly positions: Array<Position> = []) {}

  /** Count of positions in portfolio */
  public get length(): number {
    return this.positions.length;
  }

  /** Add a position to portfolio */
  public add(position: Position): void {
    this.positions.push(position);
  }

  /** Remove a position from portfolio */
  public remove(position: Position): void {
    this.positions.forEach((item, index, array) => {
      if (item === position) array.splice(index, 1);
    });
  }

  /** Does position exist */
  public has(position: Position): boolean {
    return this.positions.some((item) => item === position);
  }

  /** Total amount invested in positions */
  public get invested(): Amount {
    return this.positions.reduce(
      (sum: number, p: Position) => sum + p.invested,
      0,
    );
  }


  /** Total unrealized value of all positions */
  public value(index: Bar = 0): number {
    return this.positions.reduce(
      (sum: number, p: Position) => sum + p.value(index),
      0,
    );
  }

  /** Printable statement */
  public statement(bar: Bar): string {
    const money = (v: number): number => parseFloat(v.toFixed(2));
    const t = new Table();
    t.headers = [
      "Symbol",
      "Price",
      "Units",
      "Invested",
      "Profit",
      "Value",
    ];
    let invested = 0;
    let profit = 0;
    let value = 0;
    t.rows = this.positions.map((p) => {
      const positionValue = p.value(bar);

      // Portfolio stats
      value += positionValue;
      invested += p.invested;
      profit += positionValue - p.invested;

      return [
        p.instrument.symbol,
        money(p.price),
        p.units.toFixed(4),
        money(p.invested),
        money(positionValue - p.invested),
        money(positionValue),
      ];
    });
    t.title = `Portfolio position=${this.positions.length}, invested=${
      money(
        invested,
      )
    }, profit=${money(profit)}, value=${money(value)}`;
    return t.toString();
  }
}
