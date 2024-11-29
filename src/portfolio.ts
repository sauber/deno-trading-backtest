import { Table } from "@sauber/table";
import type { Position, Positions } from "./position.ts";
import type { Amount, Bar, PositionID } from "./types.ts";

/** A collection of instruments */
export class Portfolio {
  private readonly inventory: Record<PositionID, Position> = {};

  /* Open a portfolio optionally with number of positions */
  constructor(positions: Array<Position> = []) {
    positions.forEach((p) => this.add(p));
  }

  /** Count of positions in portfolio */
  public get length(): number {
    return Object.keys(this.inventory).length;
  }

  public get positions(): Positions {
    return Object.values(this.inventory);
  }

  /** Add a position to portfolio */
  public add(position: Position): void {
    const id: PositionID = position.id;
    this.inventory[id] = position;
  }

  /** Remove a position from portfolio */
  public remove(position: Position): void {
    const id: PositionID = position.id;
    delete this.inventory[id];
  }

  /** Does position exist */
  public has(position: Position): boolean {
    const id = position.id;
    return typeof this.inventory[id] !== "undefined";
  }

  /** Total amount invested in positions */
  public get invested(): Amount {
    return Object.values(this.inventory).reduce(
      (sum: number, p: Position) => sum + p.invested,
      0,
    );
  }

  /** Total unrealized value of all positions */
  public value(index: Bar = 0): number {
    return Object.values(this.inventory).reduce(
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
    t.rows = Object.values(this.inventory).map((p) => {
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
    t.title = `Portfolio position=${this.length}, invested=${
      money(
        invested,
      )
    }, profit=${money(profit)}, value=${money(value)}`;
    return t.toString();
  }
}
