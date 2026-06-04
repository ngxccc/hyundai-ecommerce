---
name: upstash-ratelimit
description: "Rules, standards, and references for rate limiting in serverless environments using Upstash Ratelimit. Use when implementing rate limiting, configuring Upstash Redis, or handling request blocking."
license: MIT
argument-hint: "[--limit <number>] [--window <string>]"
metadata:
  author: Team
  version: "1.0.0"
---

# Upstash Rate Limiting Guide

Comprehensive guide for rate limiting in stateless, serverless, and edge environments using `@upstash/ratelimit`.

## Core Principles

1. **Stateless Compliance**: Never use in-memory rate limiting (`RateLimiterMemory`) in serverless environments (Vercel, AWS Lambda, Cloudflare Workers). Use `@upstash/ratelimit` with Redis REST connections.
2. **Graceful Fallback**: Handle Redis timeouts and missing credentials gracefully so that infrastructure issues do not crash the application or block legitimate users.
3. **Identifier Granularity**: Rate limit based on the narrowest specific identifier (e.g., user ID, API key, or hashed client IP) to avoid blanket blocking.
4. **Asynchronous Chores**: Wait for background analytics or MultiRegion synchronization promises (`pending`) to resolve before returning responses in serverless contexts.

## When to Apply

Reference these guidelines when:
- Enforcing rate limits on public or sensitive API routes and Server Actions.
- Configuring Upstash Redis connection clients.
- Implementing IP-based deny lists or traffic protection.
- Optimizing rate limiting performance and costs in Cloudflare Workers or Vercel Edge.

## Rule Categories by Priority

| Priority | Category | Impact | Prefix | Rules |
|----------|----------|--------|--------|-------|
| 1 | Connection & Setup | CRITICAL | `setup-` | 2 |
| 2 | Algorithm Selection | HIGH | `algo-` | 1 |
| 3 | Features & Optimization | HIGH | `feat-` | 3 |

## Quick Reference

### 1. Connection & Setup (CRITICAL)

- [setup-lazy-initialization](references/setup-lazy-initialization.md) - Lazily initialize connection clients.
- [setup-await-pending-promises](references/setup-await-pending-promises.md) - Await pending promises in serverless.

### 2. Algorithm Selection (HIGH)

- [algo-sliding-window-over-fixed](references/algo-sliding-window-over-fixed.md) - Prefer sliding window for boundary accuracy.

### 3. Features & Optimization (HIGH)

- [feat-ephemeral-cache](references/feat-ephemeral-cache.md) - Enable ephemeral caching for hot containers.
- [feat-graceful-timeout](references/feat-graceful-timeout.md) - Configure client-side timeouts for fallback.
- [feat-deny-list-protection](references/feat-deny-list-protection.md) - Enable protection deny lists.

## How to Use

Read individual reference files for detailed guidelines, configurations, and code examples:

- [setup-lazy-initialization](references/setup-lazy-initialization.md)
- [setup-await-pending-promises](references/setup-await-pending-promises.md)
- [algo-sliding-window-over-fixed](references/algo-sliding-window-over-fixed.md)
- [feat-ephemeral-cache](references/feat-ephemeral-cache.md)
- [feat-graceful-timeout](references/feat-graceful-timeout.md)
- [feat-deny-list-protection](references/feat-deny-list-protection.md)

## References

- [Upstash Ratelimit Documentation](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview)
- [Upstash Console](https://console.upstash.com/)
