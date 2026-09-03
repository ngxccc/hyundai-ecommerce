import Redis, { type RedisOptions } from "ioredis";
import { env } from "@/env";

export interface RedisConnectionConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
  tls?: Record<string, unknown>;
  enableReadyCheck?: boolean;
  skipVersionCheck?: boolean;
  enableOfflineQueue?: boolean;
  connectTimeout?: number;
  maxRetriesPerRequest?: number | null;
}

export function parseRedisOptions(
  redisUrl?: string,
  fallbackHost = "localhost",
  fallbackPort = 6379,
): RedisConnectionConfig {
  if (redisUrl && redisUrl.trim().length > 0) {
    try {
      const parsed = new URL(redisUrl);
      const isUpstash =
        parsed.hostname.endsWith(".upstash.io") ||
        parsed.hostname === "upstash.io";
      const port = Number(parsed.port) || fallbackPort;

      return {
        host: parsed.hostname,
        port,
        username: parsed.username || undefined,
        password: parsed.password || undefined,
        // Cloud Redis providers (Upstash, Dragonfly, Redis Cloud) use TLS proxies where SNI hostname must be set explicitly.
        tls:
          parsed.protocol === "rediss:"
            ? {
                rejectUnauthorized: false,
                servername: parsed.hostname,
              }
            : undefined,
        enableReadyCheck: !isUpstash,
        skipVersionCheck: isUpstash,
        enableOfflineQueue: false,
        connectTimeout: 5000,
        maxRetriesPerRequest: null,
      };
    } catch {
      // Fallback gracefully on malformed or invalid Redis URL strings
    }
  }
  return {
    host: fallbackHost,
    port: fallbackPort,
    enableOfflineQueue: false,
    connectTimeout: 5000,
    maxRetriesPerRequest: null,
  };
}

/**
 * Factory creating a configured Redis client instance with optional configuration overrides.
 *
 * @param overrides - Optional Redis client options to override default settings
 */
export function createRedisClient(overrides?: RedisOptions): Redis {
  const baseOptions = parseRedisOptions(
    env.REDIS_URL,
    env.REDIS_HOST,
    env.REDIS_PORT,
  );

  return new Redis({
    ...baseOptions,
    ...overrides,
  });
}
