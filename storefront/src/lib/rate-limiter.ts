/**
 * Lightweight sliding-window rate-limiter for storefront edge/proxy layer.
 */

function parseWindowMs(windowStr: string): number {
  const parts = windowStr.trim().split(/\s+/);
  const amount = Number(parts[0]) || 60;
  const unit = parts[1] ? parts[1].toLowerCase() : "s";
  switch (unit) {
    case "ms":
      return amount;
    case "s":
    case "sec":
    case "seconds":
      return amount * 1000;
    case "m":
    case "min":
    case "minutes":
      return amount * 60 * 1000;
    case "h":
    case "hr":
    case "hours":
      return amount * 60 * 60 * 1000;
    case "d":
    case "days":
      return amount * 24 * 60 * 60 * 1000;
    default:
      return amount * 1000;
  }
}

interface RateLimitEntry {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const MAX_STORE_SIZE = 10_000;

export function checkRateLimitWithQueue(
  key: string,
  limit = 100,
  window = "60 s",
): Promise<{ success: boolean; remaining?: number; resetAt?: number }> {
  const now = Date.now();
  const windowMs = parseWindowMs(window);
  const windowStart = now - windowMs;

  let entry = rateLimitStore.get(key);
  if (!entry) {
    if (rateLimitStore.size >= MAX_STORE_SIZE) {
      const oldestKey = rateLimitStore.keys().next().value;
      if (oldestKey) rateLimitStore.delete(oldestKey);
    }
    entry = { timestamps: [] };
    rateLimitStore.set(key, entry);
  }

  // Filter timestamps within current window
  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

  if (entry.timestamps.length >= limit) {
    const oldestInWindow = entry.timestamps[0] ?? now;
    const resetAt = oldestInWindow + windowMs;
    return Promise.resolve({ success: false, remaining: 0, resetAt });
  }

  entry.timestamps.push(now);
  const remaining = Math.max(0, limit - entry.timestamps.length);
  const resetAt = (entry.timestamps[0] ?? now) + windowMs;

  return Promise.resolve({ success: true, remaining, resetAt });
}

/** Reset store for testing */
export function _resetRateLimitStore(): void {
  rateLimitStore.clear();
}
