import { Simulation } from "./mod.ts";
import { Exchange } from "./src/exchange.ts";
import { makeExchange, TestStrategy } from "./src/testdata.ts";

const exchange: Exchange = makeExchange(5);
const simulation = new Simulation(exchange, new TestStrategy());
simulation.run();
console.log(simulation.account.statement);
console.log(simulation.account.portfolio.statement(exchange.end));
