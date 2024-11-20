import { Table } from "@sauber/table";
import { Portfolio } from "./portfolio.ts";
import type { Position } from "./position.ts";
import type { Amount, Bar, Price } from "./types.ts";
import { Chart } from "./chart.ts";
import type { Exchange } from "./exchange.ts";
import { Trade } from "./trade.ts";

type Transaction = {
  bar: Bar;
  summary: string;
  amount: Amount;
  position?: Position;
  price?: Price;
  invested: Amount;
  cash: Amount;
};

type Trades = Array<Trade>;

/** A list of transaction */
class Journal {
  public readonly list: Array<Transaction> = [];

  /** Most recently added transaction */
  public get last(): Transaction {
    return this.list[this.list.length - 1];
  }

  /** Add transaction */
  public push(transaction: Transaction): void {
    const bar: Bar = transaction.bar;
    const last: Transaction = this.last;
    /** Ensure transaction only roll forward in time, ie. bar <= bar.index */
    if (last?.bar && bar > last.bar) {
      throw new Error(
        `Transaction at bar ${bar} added before newest bar ${last.bar}.`,
      );
    }
    this.list.push(transaction);
  }
}

/** Journal of transactions */
export class Account {
  private readonly journal = new Journal();

  /** Collection of positions */
  public readonly portfolio: Portfolio = new Portfolio();

  /** List of completed trades */
  public readonly trades: Trades = [];

  /** Valuation */
  public readonly valuation: Chart;

  /** Optionally deposit an amount at account opening */
  // TODO: Provide exhange with fee policy
  constructor(
    private readonly exchange: Exchange,
    deposit: number = 0,
    bar: Bar = 0,
  ) {
    this.valuation = new Chart([deposit], bar);
    if (deposit != 0) this.deposit(deposit, bar);
  }

  /** Amount of available funds */
  public get balance(): Amount {
    return this.journal.last.cash;
  }

  /** Valuation at each bar */
  private valuate(bar: Bar): void {
    const end = this.valuation.end;
    if (bar > end) {
      throw new Error(
        `Valuation at new bar ${bar} is prior to latest bar ${end}`,
      );
    }
    if (bar == end) return;

    // Catch up until bar
    const cash = this.balance;
    for (let index = end - 1; index >= bar; index--) {
      // console.log(index, 'account valuation');
      this.valuation.add(cash + this.portfolio.value(index));
    }
  }

  /** Deposit an amount to account */
  public deposit(amount: number, bar: Bar = 0) {
    this.valuate(bar);
    const prev = this.journal.last;
    const transaction: Transaction = {
      bar,
      summary: "Deposit",
      amount,
      invested: prev?.invested || 0,
      cash: (prev?.cash || 0) + amount,
    };
    this.journal.push(transaction);
  }

  /** Deposit an amount to account */
  public withdraw(amount: number, bar: Bar = 0) {
    this.valuate(bar);
    const prev = this.journal.last;
    const transaction: Transaction = {
      bar,
      summary: "Withdraw",
      amount,
      invested: prev?.invested || 0,
      cash: (prev?.cash || 0) - amount,
    };
    this.journal.push(transaction);
  }

  /** Add position to portfolio, deduct payment from cash */
  // TODO: Convert amount to position on exchange
  public add(position: Position, amount: number, bar: Bar = 0): boolean {
    this.valuate(bar);
    // Cannot open unfunded position
    const prev = this.journal.last;
    if (amount > prev.cash) return false;

    this.portfolio.add(position);
    const transaction: Transaction = {
      bar,
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
  public remove(position: Position, amount: number, bar: Bar = 0): boolean {
    // console.log(bar, 'account remove', position.print());
    this.valuate(bar);
    // Only close if actually in portfolio
    if (!this.portfolio.has(position)) return false;

    this.portfolio.remove(position);
    const prev = this.journal.last;
    const transaction: Transaction = {
      bar,
      summary: "Close",
      amount,
      position,
      price: amount / position.units,
      invested: prev.invested - position.invested,
      cash: prev.cash + amount,
    };
    this.journal.push(transaction);

    // Record completed trade
    const trade = new Trade(position, bar, amount);
    this.trades.push(trade);

    return true;
  }

  /** Oositions in portfolio */
  public get positions(): Array<Position> {
    return this.portfolio.positions;
  }

  /** Combined value of positions and balance */
  public value(bar: Bar): Amount {
    return this.balance + this.portfolio.value(bar);
  }

  /** A printable statement */
  public get statement(): string {
    const money = (v: number): number => parseFloat(v.toFixed(2));
    const table = new Table();
    table.title = "Transactions";
    table.headers = [
      "Bar",
      "Action",
      "Symbol",
      "Price",
      "Amount",
      "Invested",
      "Cash",
      "Value",
    ];
    table.rows = this.journal.list.map((t) => [
      t.bar,
      t.summary,
      t.position ? t.position.instrument.symbol : "",
      t.price ? money(t.price) : "",
      money(t.amount),
      money(t.invested),
      money(t.cash),
      money(t.invested + t.cash),
    ]);
    return table.toString();
  }
}
