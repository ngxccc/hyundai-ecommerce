import { Optional, Injectable } from "@nestjs/common";
import { SentryService } from "./sentry.service";
import { SENTRY_BREADCRUMB_CATEGORY } from "@/common/constants/sentry.constant";
import type { OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import Redlock, { type Lock, type Options as RedlockOptions } from "redlock";
import {
  createRedisClient,
  parseRedisOptions,
} from "../../config/redis.config";

/**
 * Default operational configuration for distributed locking across cluster workers.
 */
export const DEFAULT_REDLOCK_OPTIONS: RedlockOptions = {
  driftFactor: 0.01,
  retryCount: 3,
  retryDelay: 200,
  retryJitter: 50,
  automaticExtensionThreshold: 500,
};

/**
 * Provides distributed resource locking backed by Redis and the Redlock algorithm.
 */
@Injectable()
export class RedlockService implements OnModuleInit, OnModuleDestroy {
  private readonly redisClient: Redis;
  private readonly redlock: Redlock;

  constructor(
    private readonly configService?: ConfigService,
    @Optional() private readonly sentryService?: SentryService,
  ) {
    const redisUrl = this.configService?.get<string>("REDIS_URL");
    this.redisClient = createRedisClient(
      redisUrl ? parseRedisOptions(redisUrl) : undefined,
    );
    // Register error listener to prevent Node/Bun from logging unhandled EventEmitter errors on socket reconnects.
    this.redisClient.on("error", (_err: unknown) => {
      void 0;
    });

    this.redlock = new Redlock([this.redisClient], DEFAULT_REDLOCK_OPTIONS);
  }

  async onModuleInit(): Promise<void> {
    if (this.redisClient.status === "ready") return;
    const { promise, resolve } = Promise.withResolvers<unknown>();
    const timer = setTimeout(() => {
      resolve(undefined);
    }, 2000);
    const onReady = () => {
      clearTimeout(timer);
      resolve(undefined);
    };
    this.redisClient.once("ready", onReady);
    await promise;
  }

  /**
   * Acquires a distributed lock for the specified resource keys.
   *
   * @param resources - Resource keys to lock
   * @param ttl - Lock validity duration in milliseconds
   */
  async acquireLock(resources: string[], ttl = 2000): Promise<Lock> {
    this.sentryService?.addBreadcrumb({
      category: SENTRY_BREADCRUMB_CATEGORY.REDLOCK,
      message: `Attempting to acquire lock for [${resources.join(", ")}] (TTL: ${String(ttl)}ms)`,
      level: "info",
      data: { resources, ttl },
    });

    try {
      const lock = await this.redlock.acquire(resources, ttl);
      this.sentryService?.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORY.REDLOCK,
        message: `Successfully acquired lock for [${resources.join(", ")}]`,
        level: "info",
        data: { resources, expiration: lock.expiration },
      });
      return lock;
    } catch (error) {
      this.sentryService?.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORY.REDLOCK,
        message: `Failed to acquire lock for [${resources.join(", ")}]`,
        level: "warning",
        data: {
          resources,
          error: error instanceof Error ? error.message : String(error),
        },
      });
      throw error;
    }
  }

  /**
   * Releases a previously acquired distributed lock.
   *
   * @param lock - Active lock instance to release
   */
  async releaseLock(lock: Lock): Promise<void> {
    try {
      await lock.release();
      this.sentryService?.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORY.REDLOCK,
        message: `Released lock for [${lock.resources.join(", ")}]`,
        level: "info",
        data: { resources: lock.resources },
      });
    } catch {
      // Silently ignore release failures if the lock expired or was already released.
    }
  }

  /**
   * Returns the underlying Redis client instance.
   */
  getRedisClient(): Redis {
    return this.redisClient;
  }

  async onModuleDestroy(): Promise<void> {
    try {
      if (this.redisClient.status === "ready") {
        await this.redisClient.quit();
      } else {
        this.redisClient.disconnect();
      }
    } catch {
      // Prevent teardown failures when Redis is offline or disconnected during tests.
    }
  }
}
