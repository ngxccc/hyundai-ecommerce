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

export async function checkRateLimitWithQueue(
  key: string,
  limit = 5,
  window = "60 s",
  options?: {
    waitUntil?: (promise: Promise<unknown>) => void;
    after?: (fn: () => void) => void;
  },
): Promise<RateLimitResult> {
  const result = await checkRateLimit(key, limit, window);

  if (result.pending) {
    if (options?.waitUntil) {
      try {
        options.waitUntil(result.pending);
      } catch {
        // Ignore outside request/event scope
      }
    }

    if (options?.after) {
      try {
        options.after(() => result.pending);
      } catch {
        // Ignore outside request scope
      }
    } else {
      try {
        // @ts-expect-error - next/server is only available in runtime consumers
        const { after: nextAfter } = await import("next/server");
        nextAfter(() => result.pending);
      } catch {
        // Ignore outside request scope
      }
    }
  }

  return result;
}

export async function clearOverdueLock(userId: string): Promise<void> {
  if (!redis) {
    redis = Redis.fromEnv();
  }
  await redis.del(`user:overdue-lock:${userId}`);
}
