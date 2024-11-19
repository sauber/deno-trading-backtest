import { Table } from "@sauber/table";
import { Portfolio } from "./portfolio.ts";
import type { Position } from "./position.ts";
import type { Amount, Bar } from "./types.ts";

type Transaction = {
  index: Bar;
  summary: string;
  amount: number;
  position?: Position;
  price?: number;
  invested: number;
  cash: number;
};

/** A list of transaction */
class Journal {
  public readonly list: Array<Transaction> = [];

  /** Most recently added transaction */
  public get last(): Transaction {
    return this.list[this.list.length - 1];
  }

  /** Add transaction */
  public push(transaction: Transaction): void {
    const index: Bar = transaction.index;
    const last: Transaction = this.last;
    /** Ensure transaction only roll forward in time, ie. index <= last.index */
    if (last?.index && index > last.index)
      throw new Error(
        `Transaction with index ${index} added before last index ${last.index}.`
      );
    this.list.push(transaction);
  }
}

/** Journal of transactions */
export class Account {
  private readonly journal = new Journal();

  /** Collection of positions */
  public readonly portfolio: Portfolio = new Portfolio();

  /** Optionally deposit an amount at account opening */
  // TODO: Provide exhange with free policy
  constructor(deposit: number = 0, index: Bar = 0) {
    if (deposit != 0) this.deposit(deposit, index);
  }

  /** Amount of available funds */
  public get balance(): Amount {
    return this.journal.last.cash;
  }

  /** Deposit an amount to account */
  public deposit(amount: number, index: Bar = 0) {
    const prev = this.journal.last;
    const transaction: Transaction = {
      index,
      summary: "Deposit",
      amount,
      invested: prev?.invested || 0,
      cash: (prev?.cash || 0) + amount,
    };
    this.journal.push(transaction);
  }

  /** Deposit an amount to account */
  public withdraw(amount: number, index: Bar = 0) {
    const prev = this.journal.last;
    const transaction: Transaction = {
      index,
      summary: "Withdraw",
      amount,
      invested: prev?.invested || 0,
      cash: (prev?.cash || 0) - amount,
    };
    this.journal.push(transaction);
  }

  /** Add position to portfolio, deduct payment from cash */
  // TODO: Convert amount to position on exchange
  public add(position: Position, amount: number, index: Bar = 0): boolean {
    // Cannot open unfunded position
    const prev = this.journal.last;
    if (amount > prev.cash) return false;

    this.portfolio.add(position);
    const transaction: Transaction = {
      index,
      summary: "Open",
      amount,
      position,
      price: amount / position.units,
      invested: prev.invested + position.invested,
      cash: prev.cash - amount,
    };
    this.journal.push(transaction);

    return true;
  }

  /** Remove position from portfolio, add return to cash */
  // Get amount from exchange transaction
  public remove(position: Position, amount: number, index: Bar = 0): boolean {
    // Only close if actually in portfolio
    if (!this.portfolio.has(position)) return false;

    this.portfolio.remove(position);
    const prev = this.journal.last;
    const transaction: Transaction = {
      index,
      summary: "Close",
      amount,
      position,
      price: amount / position.units,
      invested: prev.invested - position.invested,
      cash: prev.cash + amount,
    };
    this.journal.push(transaction);

    return true;
  }

  /** Oositions in portfolio */
  public get positions(): Array<Position> {
    return this.portfolio.positions;
  }

  /** Combined value of positions and balance */
  public value(index: Bar): Amount {
    return this.balance + this.portfolio.value(index);
  }

  /** A printable statement */
  public get statement(): string {
    const money = (v: number): number => parseFloat(v.toFixed(2));
    const table = new Table();
    table.title = "Transactions";
    table.headers = [
      "Index",
      "Action",
      "Symbol",
      "Price",
      "Amount",
      "Invested",
      "Cash",
      "Value",
    ];
    table.rows = this.journal.list.map((t) => [
      t.index,
      t.summary,
      t.position ? t.position.instrument.symbol : "",
      t.price ? money(t.price) : "",
      money(t.amount),
      money(t.invested),
      money(t.cash),
      money(t.invested + t.cash)
    ]);
    return table.toString();
  }
}
