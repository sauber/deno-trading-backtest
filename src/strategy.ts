import type { Position, Positions } from "./position.ts";
import type { Instruments, PurchaseOrder, PurchaseOrders } from "./types.ts";

/** Pick a random item from an array */
function any<T>(items: Array<T>): Array<T> {
  const count = items.length;
  if (count < 1) return [];
  const index = Math.floor(Math.random() * count);
  return [items[index]];
}

export class Strategy {
  public readonly instruments?: Instruments;
  public readonly amount?: number;
  public readonly time?: Date;
  public readonly positions?: Positions;
  public parent?: Strategy;

  constructor(options: Partial<Strategy> = {}) {
    Object.assign(this, options);
  }

  /** Place another chain of strategies after this chain */
  public append(other: Strategy): Strategy {
    return other.prepend(this);
  }

  /** Place another chain of strategies before this chain */
  public prepend(other: Strategy): Strategy {
    if (this.parent) this.parent.prepend(other);
    else this.parent = other;
    return this;
  }

  private getAmount(): number {
    return this.amount || this.parent?.amount || 0;
  }

  private getTime(): Date {
    return this.time || this.parent?.time || new Date();
  }

  /** Generate list of buy positions or pull from parent */
  protected getBuy(): PurchaseOrders {
    if (this.instruments) {
      // Create equal position in each investor
      const amount: number = this.getAmount() / this.instruments.length;
      return this.instruments.map((instrument) => ({ instrument, amount }));
    } else if (this.parent) return this.parent.buy();
    else return [];
  }

  public buy(): PurchaseOrders {
    return this.getBuy();
  }

  /** Sel whole portfolio or parent portfolio */
  protected getSell(): Positions {
    return this.positions || this.parent?.positions || [];
  }

  public sell(): Positions {
    return this.getSell();
  }

  ////////////////////////////////////////////////////////////////////////
  // Amended strategies
  ////////////////////////////////////////////////////////////////////////

  /** Maybe buy or sell a position */
  public random(): Strategy {
    // const amount = this.getAmount();
    return new Strategy({
      parent: this,
      buy: (): PurchaseOrders =>
        Math.random() < 0.5 ? any(this.getBuy()) : [],
      sell: (): Positions => (Math.random() > 0.5 ? any(this.getSell()) : []),
    });
  }

  /** Buy nothing, sell all */
  public exit(): Strategy {
    return new Strategy({
      parent: this,
      buy: (): PurchaseOrders => [],
    });
  }

  /** Only buy active investors */
  public active(): Strategy {
    const date = this.getTime();
    return new Strategy({
      parent: this,
      buy: (): PurchaseOrders =>
        this.getBuy().filter((p: PurchaseOrder) => p.instrument.active(date)),
    });
  }

  /** Sell all expired investors */
  public expired(): Strategy {
    const date = this.getTime();
    return new Strategy({
      parent: this,
      sell: (): Positions =>
        this.getSell().filter((p: Position) => !p.instrument.active(date)),
    });
  }
}

//////////////////////////////////////////////////////////////////////
/// Custom Strategies
//////////////////////////////////////////////////////////////////////

/** Pick first N positions from buy and sell portfolio */
export class LimitStrategy extends Strategy {
  constructor(private readonly count: number, data: Partial<Strategy> = {}) {
    super(data);
  }

  public override buy(): PurchaseOrders {
    return this.getBuy().slice(0, this.count);
  }

  public override sell(): Positions {
    return this.getSell().slice(0, this.count);
  }
}

/** Buy nothing, sell nothing */
export class NullStrategy extends Strategy {
  public override buy(): PurchaseOrders {
    return [];
  }

  public override sell(): Positions {
    return [];
  }
}
