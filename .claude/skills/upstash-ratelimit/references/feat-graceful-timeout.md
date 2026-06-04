---
title: Configure Client-Side Timeouts for Fallback
impact: HIGH
impactDescription: Ensures application availability and prevents API lockouts during network latency spikes or database outages
tags: feature, timeout, fault-tolerance, resilience
---

## Configure Client-Side Timeouts for Fallback

When querying a remote rate limiter database (like Upstash Redis), network hiccups, region latency, or database outages can stall HTTP requests.
- If the rate limiter fails to resolve, you do not want your entire web API to hang or return server errors to legitimate users.
- Configure a client-side `timeout` (in milliseconds) and design the application to **pass the request by default** if rate limit verification times out.
- The default timeout is **5000ms** (5 seconds), which is too long for typical user-facing web APIs. Set a more aggressive timeout (e.g., **1000ms**).

**Incorrect (no custom timeout, default 5s blocks execution):**

```typescript
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  // Default timeout of 5 seconds is used. If Redis is slow, the request hangs for 5s.
});
```

**Correct (explicit aggressive timeout with fallback):**

```typescript
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  timeout: 1000, // Timeout after 1 second, fallback to success
});

export async function POST(req: Request) {
  // If Redis call times out, success is true by default, and reason is set to "timeout"
  const { success, reason } = await ratelimit.limit("client-ip");
  
  if (reason === "timeout") {
    console.warn("Ratelimit database timed out. Request allowed as fallback.");
  }

  if (!success) {
    return new Response("Too Many Requests", { status: 429 });
  }

  return new Response("OK");
}
```

**When NOT to use this pattern:**
- Critical payment or financial checkout endpoints where rate limiting must be guaranteed and absolute, even at the cost of service availability on timeouts.

Reference: [Upstash Ratelimit - Timeout](https://upstash.com/docs/redis/sdks/ratelimit-ts/features#timeout)
