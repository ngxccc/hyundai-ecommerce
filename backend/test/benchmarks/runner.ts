import "@nestjs/common";
import "@nestjs/core";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { BenchmarkMetric } from "./benchmark.util";

export type BenchmarkFn = () =>
  | Promise<BenchmarkMetric[] | BenchmarkMetric>
  | BenchmarkMetric[]
  | BenchmarkMetric;

async function run(): Promise<void> {
  const benchmarksDir = import.meta.dir;
  const filter = process.argv[2]?.toLowerCase();

  const files = readdirSync(benchmarksDir).filter(
    (file) =>
      file.endsWith(".bench.ts") &&
      (!filter || file.toLowerCase().includes(filter)),
  );

  if (files.length === 0) {
    console.log("No benchmark files matched the criteria.");
    return;
  }

  const allResults: BenchmarkMetric[] = [];

  for (const file of files) {
    const fullPath = join(benchmarksDir, file);
    // WHY: Dynamic import is required for the CLI runner to load runtime-discovered *.bench.ts suite modules.
    const mod = (await import(fullPath)) as {
      default?: BenchmarkFn;
      runBenchmark?: BenchmarkFn;
    };
    const runner = mod.default ?? mod.runBenchmark;

    if (typeof runner === "function") {
      const results = await runner();
      if (Array.isArray(results)) {
        allResults.push(...results);
      } else {
        allResults.push(results);
      }
    }
  }

  if (allResults.length > 0) {
    console.log("\nBenchmark Results Summary:");
    console.table(
      allResults.map((r) => ({
        Task: r.task,
        Iterations: r.iterations,
        "Min (ms)": r.minMs.toFixed(4),
        "Mean (ms)": r.avgMs.toFixed(4),
        "p50 (ms)": r.p50Ms.toFixed(4),
        "p95 (ms)": r.p95Ms.toFixed(4),
        "p99 (ms)": r.p99Ms.toFixed(4),
        "Throughput (ops/sec)": r.opsPerSec.toFixed(0),
      })),
    );
  }
  process.exit(0);
}

void run();
