import { Table } from "@sauber/table";
import { Portfolio } from "./portfolio.ts";
import type { Position } from "./position.ts";

type Transaction = {
  time: Date;
  summary: string;
  amount: number;
  position?: Position;
  price?: number;
  invested: number;
  cash: number;
};

type Init = {
  cash: 0;
  invested: 0;
};

type Journal = Array<Transaction>;

/** Journal of transactions */
export class Account {
  private readonly journal: Journal = [];

  /** Collection of positions */
  public readonly portfolio: Portfolio = new Portfolio();

  /** Optionally deposit an amount at account opening */
  constructor(deposit: number = 0, time: Date = new Date()) {
    if (deposit != 0) this.deposit(deposit, time);
  }

  /** Most recent entry in journal */
  private get last(): Transaction | Init {
    if (this.journal.length <= 0) return { cash: 0, invested: 0 };
    return this.journal[this.journal.length - 1];
  }

  /** Amount of available funds */
  public get balance(): number {
    return this.last.cash;
  }

  /** Deposit an amount to account */
  public deposit(amount: number, time: Date = new Date()) {
    const prev = this.last;
    const transaction: Transaction = {
      time,
      summary: "Deposit",
      amount,
      invested: prev.invested,
      cash: prev.cash + amount,
    };
    this.journal.push(transaction);
  }

  /** Deposit an amount to account */
  public withdraw(amount: number, time: Date = new Date()) {
    const prev = this.last;
    const transaction: Transaction = {
      time,
      summary: "Withdraw",
      amount,
      invested: prev.invested,
      cash: prev.cash - amount,
    };
    this.journal.push(transaction);
  }

  /** Add position to portfolio, deduct payment from cash */
  public add(
    position: Position,
    amount: number,
    time: Date = new Date()
  ): boolean {
    // Cannot open unfunded position
    const prev = this.last;
    if (amount > prev.cash) return false;

    this.portfolio.add(position);
    const transaction: Transaction = {
      time,
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
  public remove(
    position: Position,
    amount: number,
    time: Date = new Date()
  ): boolean {
    // Only close if actually in portfolio
    if (!this.portfolio.has(position)) return false;

    this.portfolio.remove(position);
    const prev = this.last;
    const transaction: Transaction = {
      time,
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

  /** Copy of positions */
  public get positions(): Array<Position> {
    return [...this.portfolio.positions];
  }

  /** Value if positions and balance */
  public value(time: Date = new Date()): number {
    return this.balance + this.portfolio.value(time);
  }

  /** A printable statement */
  public get statement(): string {
    const money = (v: number): number => parseFloat(v.toFixed(2));
    const table = new Table();
    table.title = "Transactions";
    table.headers = [
      "Date",
      "Action",
      "Symbol",
      "Price",
      "Amount",
      "Invested",
      "Cash",
    ];
    table.rows = this.journal.map((t) => [
      t.time.toLocaleDateString(),
      t.summary,
      t.position ? t.position.instrument.symbol : "",
      t.price ? money(t.price) : "",
      money(t.amount),
      money(t.invested),
      money(t.cash),
    ]);
    return table.toString();
  }
}
