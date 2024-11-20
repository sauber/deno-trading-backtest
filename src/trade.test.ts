import { assertInstanceOf } from "@std/assert";
import { Trade } from "./trade.ts";
import { makePosition } from "./testdata.ts";
import type { Amount, Bar } from "./types.ts";
import type { Position } from "./position.ts";

const amount: Amount = 1000;
const position: Position = makePosition(amount);
const end: Bar = 0;

Deno.test("Instance", () => {
    const trade = new Trade(position, end, amount);
    assertInstanceOf(trade, Trade);
});
