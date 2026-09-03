export interface BenchmarkMetric {
  task: string;
  iterations: number;
  minMs: number;
  avgMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  opsPerSec: number;
}

/**
 * Computes benchmark statistical distribution metrics from recorded execution times.
 *
 * @param task Descriptive task name
 * @param iterations Total number of runs
 * @param rawTimes Array of execution durations in milliseconds
 * @returns Formatted BenchmarkMetric summary object
 */
export function computeBenchmarkMetrics(
  task: string,
  iterations: number,
  rawTimes: number[],
): BenchmarkMetric {
  if (rawTimes.length === 0) {
    return {
      task,
      iterations: 0,
      minMs: 0,
      avgMs: 0,
      p50Ms: 0,
      p95Ms: 0,
      p99Ms: 0,
      opsPerSec: 0,
    };
  }

  const sorted = [...rawTimes].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, t) => acc + t, 0);
  const avg = sum / sorted.length;
  const p50 = sorted[Math.floor(sorted.length * 0.5)] ?? 0;
  const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 0;
  const p99 = sorted[Math.floor(sorted.length * 0.99)] ?? 0;
  const min = sorted[0] ?? 0;
  const totalSeconds = sum / 1000;

  return {
    task,
    iterations,
    minMs: min,
    avgMs: avg,
    p50Ms: p50,
    p95Ms: p95,
    p99Ms: p99,
    opsPerSec: totalSeconds > 0 ? iterations / totalSeconds : 0,
  };
}

/**
 * Executes a synchronous operation for a specified number of iterations and computes metrics.
 *
 * @param task Descriptive task name
 * @param fn Function to benchmark
 * @param iterations Number of iterations to execute (default 10,000)
 * @param warmupIterations Warmup runs before measurement (default 1,000)
 */
export function measureBenchmark(
  task: string,
  fn: () => void,
  iterations = 10000,
  warmupIterations = 1000,
): BenchmarkMetric {
  for (let i = 0; i < warmupIterations; i++) {
    fn();
  }

  const times: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    const end = performance.now();
    times.push(end - start);
  }

  return computeBenchmarkMetrics(task, iterations, times);
}
