import type { Position, Positions } from "./position.ts";
import type {
  Amount,
  Index,
  Instruments,
  PurchaseOrder,
  PurchaseOrders,
} from "./types.ts";

/** Pick a random item from an array */
function any<T>(items: Array<T>): Array<T> {
  const count = items.length;
  if (count < 1) return [];
  const index = Math.floor(Math.random() * count);
  return [items[index]];
}

/** Maybe true, may false */
function maybe(): boolean {
  return Math.random() < 0.5;
}

/**
 * A strategy decision which new positions to open and which existing positions to close.
 * Strategies can be chained.
 */
export class Strategy {
  public readonly name: string = "generic";
  public readonly instruments?: Instruments;
  public readonly amount?: Amount;
  public readonly index?: Index;
  public readonly positions?: Positions;
  public parent?: Strategy;

  constructor(options: Partial<Strategy> = {}) {
    Object.assign(this, options);
  }

  /** Set stategy properties */
  public set(data: Partial<Strategy>): Strategy {
    const strategy = new Strategy({ name: "set", ...data });
    return this.append(strategy);
  }

  /** First Strategy in chain*/
  public get first(): Strategy {
    return this.parent?.first || this;
  }

  /** Place another chain of strategies after this chain */
  public append(other: Strategy): Strategy {
    return other.prepend(this);
  }

  /** Place another chain of strategies before this chain */
  public prepend(other: Strategy): Strategy {
    // if (this.parent) this.parent.prepend(other);
    // else this.parent = other;
    this.parent = other;
    return this;
  }

  protected getAmount(): Amount {
    return this.amount || this.parent?.amount || 0;
  }

  protected getIndex(): Index {
    return this.index || this.parent?.index || 0;
  }

  public print(): number {
    const indent = this.parent ? this.parent.print() : 0;
    console.log(
      " ".repeat(indent),
      this.name,
      "index",
      this.index,
      "amount",
      this.amount,
      "pos",
      this.positions?.length,
      "instr",
      this.instruments?.length
    );
    return indent + 1;
  }

  /** Generate list of buy positions or pull from parent */
  protected getBuy(): PurchaseOrders {
    const ordersfn = () => {
      if (this.instruments) {
        // Create equal position in each investor
        const amount: number = this.getAmount() / this.instruments.length;
        return this.instruments.map((instrument) => ({ instrument, amount }));
      } else if (this.parent) return this.parent.buy();
      else return [];
    };
    const result: PurchaseOrders = ordersfn();
    // console.log(this.name, "getBuy()", result.length);
    return result;
  }

  /** List of purchase orders from strategy */
  public buy(): PurchaseOrders {
    return this.getBuy();
  }

  /** Sell these positions or positions of parent */
  protected getSell(): Positions {
    if (this.positions) return this.positions;
    else if (this.parent) return this.parent.sell();
    else return [];
  }

  /** List positions to sell according to strategy */
  public sell(): Positions {
    return this.getSell();
  }

  ////////////////////////////////////////////////////////////////////////
  // Amended strategies
  ////////////////////////////////////////////////////////////////////////

  /** Buy nothing, sell all */
  public exit(): Strategy {
    return new Strategy({
      name: "exit",
      parent: this,
      buy: (): PurchaseOrders => [],
    });
  }

  /** Append random strategy */
  public random(): Strategy {
    return new RandomStrategy({ parent: this });
  }

  /** Append active strategy */
  public active(): Strategy {
    return new ActiveStrategy({ parent: this });
  }

  /** Sell all expired investors */
  public expired(): Strategy {
    return new ExpiredStrategy({ parent: this });
  }

  /** Append Max Strategy */
  public max(amount: Amount): Strategy {
    return new MaxStrategy(amount, { parent: this });
  }
}

//////////////////////////////////////////////////////////////////////
/// Custom Strategies
//////////////////////////////////////////////////////////////////////

/** Pick first N positions from buy and sell portfolio */
export class LimitStrategy extends Strategy {
  public override readonly name: string = "limit";

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

/** Limit amount of each purchase order */
export class MaxStrategy extends Strategy {
  public override readonly name: string = "max";

  constructor(
    private readonly threshold: number,
    data: Partial<Strategy> = {}
  ) {
    super(data);
  }

  public override buy(): PurchaseOrders {
    return this.getBuy().map((o) => ({
      amount: Math.min(this.getAmount(), this.threshold),
      instrument: o.instrument,
    }));
  }
}

/** Buy nothing, sell nothing */
export class NullStrategy extends Strategy {
  public override readonly name: string = "null";

  public override buy(): PurchaseOrders {
    return [];
  }

  public override sell(): Positions {
    return [];
  }
}

/** Maybe buy a position, maybe sell a position */
export class RandomStrategy extends Strategy {
  public override readonly name: string = "random";

  public override buy(): PurchaseOrders {
    return maybe()
      ? any(this.getBuy()).map((o) => ({
          amount: this.getAmount(),
          instrument: o.instrument,
        }))
      : [];
  }

  public override sell(): Positions {
    return maybe() ? any(this.getSell()) : [];
  }
}

/** Buy only active instruments */
export class ActiveStrategy extends Strategy {
  public override readonly name: string = "active";

  public override buy(): PurchaseOrders {
    return this.getBuy().filter((p: PurchaseOrder) =>
      p.instrument.active(this.getIndex())
    );
  }
}

/** Sell all inactive positions */
export class ExpiredStrategy extends Strategy {
  public override readonly name: string = "expired";

  public override sell(): Positions {
    return this.getSell().filter(
      (p: Position) => !p.instrument.active(this.getIndex())
    );
  }
}
