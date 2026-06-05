---
title: Prefer Sliding Window for Boundary Accuracy
impact: HIGH
impactDescription: Prevents clients from bypassing limits through rapid bursts near window boundaries
tags: algorithm, configuration, sliding-window, rate-limiting
---

## Prefer Sliding Window for Boundary Accuracy

The **Fixed Window** algorithm divides time into fixed buckets (e.g. 1-minute blocks). This creates a vulnerability called **Boundary Burst**:
- A client with a limit of 10 requests/minute can send 10 requests at `00:00:59` (end of window 1) and another 10 requests at `00:01:01` (start of window 2).
- They successfully sent 20 requests within 2 seconds, bypassing the intended limit of 10 requests/minute.

For critical endpoints (e.g., authentication, payments, uploads), prefer the **Sliding Window** algorithm, which uses a rolling window weighted approximation to smooth out boundary spikes.

**Incorrect (using fixed window for critical auth route):**

```typescript
const loginLimiter = new Ratelimit({
  redis,
  // Vulnerable to boundary burst: user can send 2x rate on window reset boundaries
  limiter: Ratelimit.fixedWindow(5, "60 s"), 
});
```

**Correct (using sliding window for critical auth route):**

```typescript
const loginLimiter = new Ratelimit({
  redis,
  // Rolling window checks rate accurately across boundaries
  limiter: Ratelimit.slidingWindow(5, "60 s"),
});
```

**When NOT to use this pattern:**
- Non-critical, high-throughput global API endpoints where absolute accuracy is less important than minimizing Redis command count (Fixed Window uses ~2 commands, whereas Sliding Window uses ~4 commands).

Reference: [Upstash Ratelimit - Algorithms](https://upstash.com/docs/redis/sdks/ratelimit-ts/algorithms)
