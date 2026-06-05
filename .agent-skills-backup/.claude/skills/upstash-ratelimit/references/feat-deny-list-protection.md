---
title: Enable Protection Deny Lists
impact: MEDIUM
impactDescription: Automatically blocks malicious actors, spam user agents, or targeted countries before they impact application endpoints
tags: feature, traffic-protection, deny-list, security
---

## Enable Protection Deny Lists

To prevent known malicious actors from abusing your endpoints, Upstash Ratelimit supports **Deny Lists** (blocking by IP, user agent, country, or custom ID) and **Auto IP Deny List** (blocking aggregate malicious IPs automatically, refreshed daily from GitHub IPSUM aggregation).
- Enable this feature by setting `enableProtection: true` on client configuration.
- To execute checks, you must pass IP, user agent, or country headers into the `limit()` invocation.

**Incorrect (protection disabled, metadata omitted during limit check):**

```typescript
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  // CRITICAL: Deny list protection is false by default
});

export async function POST(req: Request) {
  // CRITICAL: Omitting client metadata prevents IP/country blocklists from working
  const { success } = await ratelimit.limit("user_123");
  // ...
}
```

**Correct (protection enabled, passing client metadata):**

```typescript
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  enableProtection: true, // Enable deny lists and Auto IP protection
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "";
  const country = req.headers.get("cf-ipcountry") || ""; // Geolocation country header

  const { success, reason, deniedValue, pending } = await ratelimit.limit("user_123", {
    ip,
    userAgent,
    country,
  });

  if (pending) {
    waitUntil(pending); // Await async daily IP deny list synchronization
  }

  if (!success && reason === "denyList") {
    console.warn(`Access denied to blocked actor matching: ${deniedValue}`);
    return new Response("Forbidden", { status: 403 });
  }

  if (!success) {
    return new Response("Too Many Requests", { status: 429 });
  }

  return new Response("OK");
}
```

**When NOT to use this pattern:**
- Internal microservices, private VPC routes, or trusted admin dashboards where deny list checking is redundant and incurs unnecessary command overhead (+2 commands).

Reference: [Upstash Ratelimit - Traffic Protection](https://upstash.com/docs/redis/sdks/ratelimit-ts/traffic-protection)
