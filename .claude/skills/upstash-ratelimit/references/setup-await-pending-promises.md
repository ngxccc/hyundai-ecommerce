---
title: Await Pending Promises in Serverless Environments
impact: CRITICAL
impactDescription: Prevents background tasks (analytics & multi-region sync) from being cut off when serverless functions terminate
tags: setup, serverless, edge, async-handling
---

## Await Pending Promises in Serverless Environments

Serverless Functions (like Vercel Serverless) and Edge runtimes (like Vercel Edge or Cloudflare Workers) terminate container execution immediately after the HTTP response is returned to the user.
- If you use **analytics** (`analytics: true`) or **Multi-Region replication**, Upstash Ratelimit performs these synchronization chores asynchronously in the background.
- If the runtime shuts down immediately, these background promises are destroyed, resulting in lost analytics data or failed region replication.

Enforce waiting on background synchronization by passing the `pending` promise to `waitUntil` (or by awaiting it before returning the response).

**Incorrect (dangling background promise):**

```typescript
export async function POST(req: Request) {
  // ...
  const { success } = await ratelimit.limit("user_123"); // Analytics call is triggered in background

  if (!success) return new Response("Too Many Requests", { status: 429 });

  // CRITICAL: Analytics data may be lost if Vercel shuts down this function immediately
  return new Response("Success");
}
```

**Correct (Vercel Functions - using Vercel's `waitUntil`):**

```typescript
import { waitUntil } from "@vercel/functions";

export async function POST(req: Request) {
  // ...
  const { success, pending } = await ratelimit.limit("user_123");

  // Keep the container alive until the background analytics/sync promise resolves
  if (pending) {
    waitUntil(pending);
  }

  if (!success) return new Response("Too Many Requests", { status: 429 });

  return new Response("Success");
}
```

**Correct (Cloudflare Workers / Edge Middleware - using Context):**

```typescript
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    // ...
    const { success, pending } = await ratelimit.limit("user_123");

    if (pending) {
      ctx.waitUntil(pending);
    }

    if (!success) return new Response("Too Many Requests", { status: 429 });

    return new Response("Success");
  }
}
```

**When NOT to use this pattern:**
- Persistent Node.js backends (e.g. Express/Koa) where the process is persistent and background promises resolve naturally.

Reference: [Upstash Ratelimit - Serverless Environments](https://upstash.com/docs/redis/sdks/ratelimit-ts/gettingstarted#serverless-environments)
