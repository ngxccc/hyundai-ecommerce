---
title: Enable Ephemeral Caching for Hot Containers
impact: HIGH
impactDescription: Prevents database query storms and reduces API costs during brute-force or denial of service attacks
tags: feature, caching, optimization, cost-reduction
---

## Enable Ephemeral Caching for Hot Containers

During a brute-force attack or distributed denial of service (DDoS), querying Redis for every single request—just to confirm it should be blocked—can consume thousands of Redis commands and rack up substantial cloud costs.
- Upstash Ratelimit supports **Ephemeral Caching** using local memory (`Map<string, number>`).
- When a client is blocked, their identifier and block duration are cached. Subsequent requests are blocked instantly in-memory without querying Redis.
- To benefit from caching in serverless runtimes, the cache map must be instantiated **outside the handler function** so it persists across hot container invocations.

**Incorrect (cache instantiated inside handler, empty on every run):**

```typescript
export async function POST(req: Request) {
  // CRITICAL: Cache is recreated on every request invocation, rendering it useless
  const ephemeralCache = new Map<string, number>();

  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "60 s"),
    ephemeralCache,
  });

  // Always queries Redis on cache miss
  const { success } = await ratelimit.limit("client-ip"); 
  // ...
}
```

**Correct (cache instantiated globally outside handler):**

```typescript
// PERSISTS IN MEMORY ACROSS HOT CONTAINER RUNS
const ephemeralCache = new Map<string, number>();

export async function POST(req: Request) {
  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "60 s"),
    ephemeralCache, // Reuses cache map
  });

  // If client-ip is rate-limited, subsequent checks are blocked in RAM (Command Count: 0)
  const { success, reason } = await ratelimit.limit("client-ip");
  
  if (!success && reason === "cacheBlock") {
    console.log("Blocked locally by ephemeral cache.");
  }
  // ...
}
```

**When NOT to use this pattern:**
- When client state changes must reflect instantly across all server instances (ephemeral cache holds block states for up to 1 minute locally). To disable local caching completely, pass `ephemeralCache: false`.

Reference: [Upstash Ratelimit - Caching](https://upstash.com/docs/redis/sdks/ratelimit-ts/features#caching)
