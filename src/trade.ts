import type { Position } from "./position.ts";
import type { Amount, Bar, Reason } from "./types.ts";

/** Position that has been opened and closed */
export class Trade {
  constructor(
    public readonly position: Position,
    public readonly end: Bar,
    public readonly amount: Amount,
    public readonly reason: Reason,
  ) {}

  /** Number for bars from start to end */
  public get length(): number {
    return this.position.start - this.end;
  }
}
