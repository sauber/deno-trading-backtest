/** Generate data for testing */
import type { Instrument } from "@sauber/trading-account";
import { nanoid } from "nanoid";
import { plot } from "asciichart";

/** Box-Muller Normal Distribution Between 0 and 1 */
function randn_bm(): number {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  num = num / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0) return randn_bm(); // resample between 0 and 1
  return num;
}

/** Generate a random chart */
function randomChart(count: number): number[] {
  const chart: number[] = [];
  let price = 1000 * Math.random();
  for (let i = 0; i < count; i++) {
    const change = (randn_bm() - 0.5) / 5;
    price *= 1 + change;
    chart.push(parseFloat(price.toFixed(4)));
  }
  return chart;
}

/** Average samples from array */
function resample(data: number[], count: number): number[] {
  // No resample if too little data
  if (count >= data.length) return data;

  // Average of numbers
  const average = (arr: number[]) =>
    arr.reduce((p: number, c: number) => p + c, 0) / arr.length;

  // Downsample buckets
  const output: number[] = [];
  const bucketSize = data.length / count;
  for (let i = 1; i <= count; ++i) {
    const bucket: number[] = data.slice(
      Math.floor((i - 1) * bucketSize),
      Math.ceil(i * bucketSize)
    );
    output.push(average(bucket));
  }
  return output;
}

/** An instrument with a random symbol and random price */
export class RandomInstrument implements Instrument {
  public readonly symbol: string = nanoid(4).toUpperCase();
  private readonly length: number = 700;
  public readonly chart: number[] = randomChart(this.length);
  private readonly end: Date = new Date();
  private readonly start: Date = new Date(
    new Date().setDate(this.end.getDate() - this.length)
  );

  /** Random price with 10% of base price */
  public price(time: Date): number {
    const diff = time.getTime() - this.start.getTime();
    const diffDays = Math.ceil(diff / (1000 * 3600 * 24));
    return this.chart[diffDays];
  }

  /** Always active */
  public active(time: Date): boolean {
    return time >= this.start && time <= this.end;
  }

  public plot(height: number = 15, width: number = 78): string {
    height -= 2;
    const chart = resample(this.chart, width - 7);
    const padding = "       ";
    return "[ " + this.symbol + " ]\n" + plot(chart, { height, padding });
  }
}
