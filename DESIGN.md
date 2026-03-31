# Trading Simulation

Given an amount of cash, a set of instruments and an agent making buy and sell
decision, run a simulation of trading activities.

## Bar

Instrument prices are indexed by Bar. Bar 0 is most recent, Bar 1 is most
previous Bar to recent Bar and the first and highest Bar is the first price
available for an instrument.

## Instrument

An Instrument have a number of bars in Float32Array format sorted by oldest bar
first and newest last. Instruments do not necessarily have same start or end
Bar, nor same length.

An Instrument has a Symbol identifier and optional long name.

## Open Position

An Open Position is a purchase of an Instrument at a Bar with an amount. Number
of shares can be fractional, so any amount will be allowed.

## Closed Position

A Closed Position is an Open Position, which have been sold at same or more
recent Bar. Profit for each Closed Position is calculated.

## Agent

For each Bar available from oldest to newest, provide agent the Bar index, a
list of open positions, a list of instruments available for trading at this bar,
cash balance available.

The agent generates a list of existing open positions to close and a list of new
positions to open.

Simulation controls that new positions to open do not exceed cash amount
available.

## Liquidation

If an open position is on an Instrument which no longer have price data
available, then position is forced closed at last price for the instrument.

## Exchange

An Exchange is associated to the simulation, which will change cash for a
Position or a Position for cash. There is a commission in each case, which is a
fraction of the cash amount, default to 0.001.

## Simulation

The first Bar is the oldest Bar among all the instruments and the last Bar is
the newest Bar among all the instruments. The simulation steps through each Bar.
At each Bar these transactions are performed:

- Force close any open positions which no longer have price data
- Sell open positions advised by Agent
- Open positions advised by Agent

Each transaction is recorded along with a resulting cash balance.

At end of simulation these data are exposed:

- Amount of cash available at end of Bar as Float32Array
- Total value of all Open Positions at end of Bar as Float32Array
- Sum of cash and value of open positions at end of ach Bar
- List Open Positions still open after end of simulation
- A statement of all transactions, including: Bar, transaction type (Open,
  Close, Force), Amount, Profit, Total Value of all Positions, Cash Saldo

## Evaluation

A selection of evaluators of financial performance:

- WinRatio: Ratio of positions resulting in positive profit
- ProfitFactor: Total value at end of simulation as ratio of starting cash value
- SharpeRatio: of total value at each bar
- Velocity: Average number of transactions per Bar
- InvestedRatio: Average of Invested value as ratio of total Value
- MaxDrawdown: Maximum drawdown throughout simulation
- Commission: Total amount of commission paid
- PositionDuration: Average number of Bars between open and close
- AnnualizedReturn: CAGR
