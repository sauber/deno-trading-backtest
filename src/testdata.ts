/** Generate data for testing */
import type { Instrument } from "./types.ts";
import { nanoid } from "nanoid";
import { plot } from "asciichart";
import { downsample, randn } from "@sauber/statistics";

/** Generate a random chart */
function randomChart(count: number): number[] {
  const chart: number[] = [];
  let price = 1000 * Math.random();
  for (let i = 0; i < count; i++) {
    const change = (randn() - 0.5) / 5; // +/- 2.5%
    price *= 1 + change;
    chart.push(parseFloat(price.toFixed(4)));
  }
  return chart;
}

/** An instrument with a random symbol and random price */
export class RandomInstrument implements Instrument {
  public readonly symbol: string = nanoid(4).toUpperCase();
  private readonly length: number = 700;
  private readonly chart: number[] = randomChart(this.length);
  public readonly end: Date = new Date();
  public readonly start: Date = new Date(
    new Date().setDate(this.end.getDate() - this.length)
  );

  /** Random price with 10% of base price */
  public price(time: Date): number {
    const diff = time.getTime() - this.start.getTime();
    const diffDays = Math.ceil(diff / (1000 * 3600 * 24));
    return this.chart[diffDays];
  }

  /** Active if within  */
  public active(time: Date): boolean {
    return time >= this.start && time <= this.end;
  }

  /** Printable Ascii Chart */
  public plot(height: number = 15, width: number = 78): string {
    height -= 2;
    const chart = downsample(this.chart, width - 7);
    const padding = "       ";
    return "[ " + this.symbol + " ]\n" + plot(chart, { height, padding });
  }
}
