import * as asciichart from "asciichart";
import { Table } from "@sauber/table";
import { downsample, regression, std } from "@sauber/statistics";
import { Portfolio } from "./portfolio.ts";
import type { Position } from "./position.ts";
import type { Amount, Bar, Price } from "./types.ts";
import type { Instrument } from "./instrument.ts";
import type { Exchange } from "./exchange.ts";
import { Trade } from "./trade.ts";
import { Chart } from "./chart.ts";

type Saldo = {
  cash: Amount;
  equity: Amount;
};

type Order = {
  bar: Bar;
  summary: string;
  amount: Amount;
  position: Position;
  price: Price;
  saldo: Saldo;
};

type Cashflow = {
  bar: Bar;
  summary: string;
  amount: Amount;
  saldo: Saldo;
};

type Valuation = {
  bar: Bar;
  summary: "Valuation";
  saldo: Saldo;
};

type Transaction = Cashflow | Valuation | Order;

export type Trades = Array<Trade>;

/** A consecutive list of transactions */
class Journal {
  /** First bar */
  public start: Bar = -Infinity;

  /** Current last bar */
  public end: Bar = Infinity;

  public readonly list: Array<Transaction> = [];

  constructor(private readonly portfolio: Portfolio) {}

  /** First transaction */
  public get first(): Saldo {
    if (this.list.length > 0) return this.list[0].saldo;
    else return { cash: 0, equity: 0 };
  }

  /** Most recently added transaction */
  public get last(): Saldo {
    if (this.list.length > 0) return this.list[this.list.length - 1].saldo;
    else return { cash: 0, equity: 0 };
  }

  /** Add trade */
  public add(transaction: Transaction): void {
    this.list.push(transaction);
    const bar: Bar = transaction.bar;
    if (bar > this.start) this.start = bar;
    if (bar < this.end) this.end = bar;
  }

  /** Find first transaction at bar */
  public saldo(bar: Bar): Saldo {
    const transaction: Transaction | undefined =
      (bar > this.start || bar < this.end)
        ? undefined
        : this.list.find((t) => t.bar === bar);
    if (transaction) return transaction.saldo;
    return { cash: 0, equity: 0 };
  }

  /** Daily saldo from start to end */
  public daily(): Array<Saldo> {
    let bar: Bar = Infinity;
    return this.list.filter((t: Transaction) => {
      if (t.bar == bar) return false;
      bar = t.bar;
      return true;
    }).map((t) => t.saldo);
  }
}

/** An account belonging to Exchange */
export class Account {
  /** Collection of positions */
  public readonly portfolio: Portfolio = new Portfolio();

  private readonly journal = new Journal(this.portfolio);

  /** List of completed trades */
  public readonly trades: Trades = [];

  /** Optionally deposit an amount at account opening */
  constructor(
    private readonly exchange: Exchange,
    deposit: number = 0,
    bar: Bar = 0,
  ) {
    if (deposit != 0) this.deposit(deposit, bar);
  }

  /** Amount of available funds */
  public get balance(): Amount {
    return this.journal.last.cash;
  }

  /** Valuation at each bar */
  private valuate(bar: Bar): void {
    if (bar > this.journal.end) {
      throw new Error(
        `Valuation at new bar ${bar} is prior to latest bar ${this.journal.end}`,
      );
    }
    if (bar == this.journal.end) return;
    if (this.journal.end === Infinity) return;

    // Catch up until bar
    const cash: Amount = this.journal.last.cash;
    for (let index = this.journal.end - 1; index >= bar; index--) {
      const equity: number = this.portfolio.value(index);
      const saldo: Saldo = { cash, equity };
      const valuation: Valuation = { bar: index, summary: "Valuation", saldo };
      this.journal.add(valuation);
    }
  }

  /** Deposit an amount to account */
  public deposit(amount: number, bar: Bar = 0) {
    this.valuate(bar);
    const prev: Saldo = this.journal.last;
    const transaction: Cashflow = {
      bar,
      summary: "Deposit",
      amount,
      saldo: { cash: prev.cash + amount, equity: prev.equity },
    };
    this.journal.add(transaction);
  }

  /** Deposit an amount to account */
  public withdraw(amount: number, bar: Bar = 0) {
    this.valuate(bar);
    const prev: Saldo = this.journal.last;
    const transaction: Cashflow = {
      bar,
      summary: "Withdraw",
      amount,
      saldo: { cash: prev.cash - amount, equity: prev.equity },
    };
    this.journal.add(transaction);
  }

  /** Add position to portfolio, deduct payment from cash */
  public add(
    instrument: Instrument,
    amount: Amount,
    bar: Bar = 0,
  ): Position | undefined {
    // Cannot open unfunded position
    const prev: Saldo = this.journal.last;
    if (amount > prev.cash) return;

    // Let Exchange create position
    const position = this.exchange.buy(instrument, amount, bar);

    this.valuate(bar);
    this.portfolio.add(position);
    const transaction: Order = {
      bar,
      summary: "Open",
      amount,
      position,
      price: amount / position.units,
      saldo: { cash: prev.cash - amount, equity: prev.equity + amount },
    };
    this.journal.add(transaction);

    return position;
  }

  /** Remove position from portfolio, add return to cash */
  // Get amount from exchange transaction
  public remove(position: Position, bar: Bar = 0, reason: string ="Close"): boolean {
    // Only close if actually in portfolio
    if (!this.portfolio.has(position)) return false;

    // Let exchange return amount from position
    const amount: Amount = this.exchange.sell(position, bar);

    this.valuate(bar);
    this.portfolio.remove(position);
    const prev: Saldo = this.journal.last;
    const transaction: Transaction = {
      bar,
      summary: reason,
      amount,
      position,
      price: amount / position.units,
      saldo: { cash: prev.cash + amount, equity: prev.equity - amount },
    };
    this.journal.add(transaction);

    // Record completed trade
    const trade = new Trade(position, bar, amount);
    this.trades.push(trade);

    return true;
  }

  /** Positions in portfolio */
  public get positions(): Array<Position> {
    return this.portfolio.positions;
  }

  /** Combined value of positions and balance */
  public value(bar: Bar): Amount {
    this.valuate(bar);
    const saldo: Saldo = this.journal.saldo(bar);
    const sum: number = saldo.cash + saldo.equity;
    return sum;
  }

  /** A printable statement */
  public get toString(): string {
    const money = (v: number): number => parseFloat(v.toFixed(2));
    const table = new Table();
    table.title = "Transactions";
    table.headers = [
      "Bar",
      "Action",
      "Symbol",
      "Price",
      "Amount",
      "Equity",
      "Cash",
      "Value",
    ];
    table.rows = this.journal.list.filter((t) => t.summary != "Valuation").map((
      t,
    ) => [
      t.bar,
      t.summary,
      ("position" in t) ? t.position.instrument.symbol : "",
      ("price" in t) ? money(t.price) : "",
      ("amount" in t) ? money(t.amount) : "",
      money(t.saldo.equity),
      money(t.saldo.cash),
      money(t.saldo.equity + t.saldo.cash),
    ]);
    return table.toString();
  }

  /** Count of bars from start to end */
  public get bars(): number {
    return this.journal.start - this.journal.end + 1;
  }

  /** End result as ratio of start amount */
  public get profit(): number {
    const firstSaldo: Saldo = this.journal.first;
    const lastSaldo: Saldo = this.journal.last;
    const firstValue: Amount = firstSaldo.cash + firstSaldo.equity;
    const lastValue: Amount = lastSaldo.cash + lastSaldo.equity;
    return lastValue / firstValue - 1;
  }

  /** Total of gains vs total of all movement */
  public get WinRatio(): number {
    const val: Saldo[] = this.journal.daily();
    let [gain, move] = [0, 0];
    for (let i = 1; i < val.length; i++) {
      const today: Amount = val[i].cash + val[i].equity;
      const yesterday: Amount = val[i - 1].cash + val[i - 1].equity;
      const diff = today - yesterday;
      move += Math.abs(diff);
      if (diff >= 0) gain += diff;
    }
    if (move === 0) return 0;
    return gain / move;
  }

  /** On average, of total value how much is invested */
  public get InvestedRatio(): number {
    const val: Saldo[] = this.journal.daily();
    let ratio = 0;
    for (let i = 0; i < val.length; i++) {
      ratio += val[i].equity / (val[i].equity + val[i].cash);
    }
    const r = ratio / val.length;
    return r;
  }

  /** How much chart diverts from exponential curve */
  public get fragility(): number {
    const val: number[] = this.journal.daily().map((v) => v.equity + v.cash);
    const reg = regression(val.map((v) => Math.log(v)));
    const curve: number[] = val.map((_, i) =>
      Math.exp(reg.intercept + reg.gradiant * i)
    );
    const dev: number = std(val.map((v, i) => v - curve[i]));
    const mean: number = val.slice().sort()[Math.floor(val.length / 2)];
    const fragility = dev / mean;
    return fragility;
  }

  /** Printable Ascii Chart */
  public plot(width: number = 78, height: number = 15): string {
    const saldo = this.journal.daily();
    const cash = saldo.map((s) => s.cash);
    const value = saldo.map((s) => s.cash + s.equity);

    const axisWidth = Math.max(
      ...[cash[0], cash[cash.length - 1], value[0], value[value.length - 1]]
        .map((v) => v.toFixed(2).length),
    );

    const v1 = downsample(cash, width - axisWidth - 2);
    const v2 = downsample(value, width - axisWidth - 2);
    const padding = " ".repeat(axisWidth);

    const config = {
      colors: [asciichart.green, asciichart.red],
      height: height - 1,
      padding,
    };

    return asciichart.plot([v1, v2], config);
  }

  /** Standard deviation of log of daily total value */
  public get stddev(): number {
    const saldo = this.journal.daily();
    const logValue = saldo.map((s) => Math.log(s.cash + s.equity));
    const stddev: number = std(logValue);
    return Math.exp(stddev);
  }
}
