# Trading backtest

Run a trading strategy against a market of instruments, and calculate performance results. See `example.ts` for usage.

## Benchmark profiling

```
deno run --v8-flags=--prof src/benchmark_bin.ts
node --prof-process isolate-*-v8.log > profile.txt
more profile.txt
rm profile.txt
rm isolate-*-v8.log
```