# Benchmarking & Performance Testing Standards

Location: `test/benchmarks/<domain>.bench.ts`  
Runner: `bun run test:bench` or `bun test/benchmarks/runner.ts <filter>`

---

## 1. The 7 Production Benchmarking Invariants

- **INV-B1 (Warmup)**: Execute $\ge 1,000$ warmup iterations before measurement to stabilize JIT optimization tiers and type feedback.
- **INV-B2 (Sink / Anti-DCE)**: Consume or return evaluated results (`const res = ...; if (!res) throw ...`) to prevent compiler dead-code elimination.
- **INV-B3 (High-Res Timing)**: Use `performance.now()` with $\ge 10,000$ iterations for sub-microsecond operations to amortize timer resolution limits.
- **INV-B4 (Percentiles)**: Record `p50` (median), `p95`, `p99` (tail latency), `Min`, and `Throughput (ops/sec) = 1000 / Mean_ms`. Never rely on arithmetic mean alone.
- **INV-B5 (In-Memory Isolation)**: Micro-benchmarks MUST be strictly CPU and memory bound. Resolve or mock all database, network, and disk I/O before the timed loop.
- **INV-B6 (Workload Parity)**: Competing implementations MUST execute 100% identical validation rules, sanitization steps, regex patterns, and constraints.
- **INV-B7 (Dual-Path Evaluation)**: Measure both **Happy Path** (valid payload) and **Error Path** (invalid payload failing multiple constraints to benchmark error tree generation).

---

## 2. Benchmark Suite Contract

Every benchmark file MUST export a runner function:

```ts
import { measureBenchmark, type BenchmarkMetric } from "./benchmark.util";

export function runBenchmark(): BenchmarkMetric[] | Promise<BenchmarkMetric[]> {
  return [
    measureBenchmark(
      "Scenario Name",
      () => {
        /* work */
      },
      10000,
      1000,
    ),
  ];
}
export default runBenchmark;
```

---

## 3. Output Standards

Render exclusively via `console.table()` with columns: `Task`, `Iterations`, `Min (ms)`, `Mean (ms)`, `p50 (ms)`, `p95 (ms)`, `p99 (ms)`, `Throughput (ops/sec)`. Emojis and decorative ASCII borders are prohibited.
