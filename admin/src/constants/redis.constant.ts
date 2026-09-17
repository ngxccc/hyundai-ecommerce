/**
 * Centralized Redis key generators and namespaces.
 * Eliminates magic string keys and unifies cache & rate limiting key schemas.
 */
export const REDIS_KEYS = {
  RATE_LIMIT: {
    ADMIN_LOGIN: (ip: string) => `login:admin:${ip}`,
    ADMIN_PAGE: (ip: string) => `ratelimit:admin_page:${ip}`,
  },
} as const;
