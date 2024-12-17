import type { Position } from "./position.ts";
import type { Amount, Bar } from "./types.ts";

/** Position that has been opened and closed */
export class Trade {
  constructor(
    private readonly position: Position,
    private readonly end: Bar,
    private readonly amount: Amount,
  ) {}

  /** Number for bars from start to end */
  public get length(): number {
    return this.position.start - this.end;
  }
}
