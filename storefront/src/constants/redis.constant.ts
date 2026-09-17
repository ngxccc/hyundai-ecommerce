/**
 * Centralized Redis key generators and namespaces for Storefront.
 * Eliminates magic string keys and unifies cache & rate limiting key schemas.
 */
export const REDIS_KEYS = {
  RATE_LIMIT: {
    PAGE: (ip: string) => `ratelimit:page:${ip}`,
    LOGIN: (ip: string) => `login:customer:${ip}`,
  },
} as const;
