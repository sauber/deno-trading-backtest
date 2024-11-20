import { Simulation } from "./mod.ts";
import { makeExchange, TestStrategy } from "./src/testdata.ts";

const simulation = new Simulation(makeExchange(5), new TestStrategy());
simulation.run();
console.log(simulation.account.statement);
console.log(simulation.account.portfolio.statement);
