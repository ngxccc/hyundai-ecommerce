import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
  pending: Promise<unknown>;
}

let redis: Redis | null = null;
const ratelimiters = new Map<string, Ratelimit>();

/**
 * Checks rate limiting for a given identifier using Upstash Redis.
 * Lazily initializes Redis/Ratelimit clients to prevent build-time crashes.
 *
 * @param key Unique identifier (e.g., IP address, user ID)
 * @param limit Maximum requests allowed in the window (default: 5)
 * @param window Time window format (default: "60 s")
 */
export async function checkRateLimit(
  key: string,
  limit = 5,
  window = "60 s",
): Promise<RateLimitResult> {
  // const url = process.env.UPSTASH_REDIS_REST_URL;
  // const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  // // Graceful fallback if credentials are not configured (e.g. in local dev or CI pipeline)
  // if (!url || !token) {
  //   console.warn("Upstash Redis credentials missing. Rate limiting bypassed.");
  //   return {
  //     success: true,
  //     remaining: limit,
  //     reset: Date.now() + 60000,
  //     pending: Promise.resolve(),
  //   };
  // }

  if (!redis) {
    redis = Redis.fromEnv();
  }

  const configKey = `${limit}:${window}`;
  let limiter = ratelimiters.get(configKey);

  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, window as Duration),
      analytics: true,
    });
    ratelimiters.set(configKey, limiter);
  }

  const { success, remaining, reset, pending } = await limiter.limit(key);

  return {
    success,
    remaining,
    reset,
    pending,
  };
}
