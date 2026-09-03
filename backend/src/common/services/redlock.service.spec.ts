import type { SentryService } from "./sentry.service";
import { SENTRY_BREADCRUMB_CATEGORY } from "@/common/constants/sentry.constant";
import type { Lock } from "redlock";
import { describe, expect, it, beforeEach, afterEach, mock } from "bun:test";
import { RedlockService } from "./redlock.service";
import { ConfigService } from "@nestjs/config";

function createMockLock(
  resources: string[],
  releaseFn?: () => Promise<never>,
): Lock {
  return {
    resources,
    value: "test-lock-value",
    attempts: [],
    expiration: Date.now() + 2000,
    release: releaseFn
      ? mock(releaseFn)
      : mock(() => Promise.resolve({ attempts: [] })),
    extend: mock(() => Promise.resolve({} as Lock)),
  } as unknown as Lock;
}

describe("RedlockService", () => {
  let redlockService: RedlockService;
  let configService: ConfigService;

  beforeEach(() => {
    configService = new ConfigService({
      REDIS_URL: "redis://localhost:6379",
    });
    redlockService = new RedlockService(configService);
  });

  afterEach(async () => {
    await redlockService.onModuleDestroy();
  });

  describe("when initializing and destroying module lifecycle", () => {
    it("should instantiate RedlockService correctly and handle background socket error events", () => {
      expect(redlockService).toBeDefined();
      const redisClient = redlockService.getRedisClient();
      expect(redisClient).toBeDefined();
      expect(() => {
        redisClient.emit("error", new Error("Socket error"));
      }).not.toThrow();
    });

    it("should fallback to default redis configuration when configService is not provided", async () => {
      const serviceWithoutConfig = new RedlockService();
      expect(serviceWithoutConfig.getRedisClient()).toBeDefined();
      await serviceWithoutConfig.onModuleDestroy();
    });

    it("should resolve immediately on onModuleInit when redis client is already in ready status", async () => {
      Object.defineProperty(redlockService, "redisClient", {
        value: {
          status: "ready",
          on: mock(() => undefined),
          once: mock(() => undefined),
        },
        configurable: true,
      });

      await redlockService.onModuleInit();
    });

    it("should wait for ready event on onModuleInit when redis client status is connecting", async () => {
      const onceMock = mock((event: string, cb: () => void) => {
        if (event === "ready") {
          cb();
        }
      });

      Object.defineProperty(redlockService, "redisClient", {
        value: {
          status: "connecting",
          on: mock(() => undefined),
          once: onceMock,
        },
        configurable: true,
      });

      await redlockService.onModuleInit();
      expect(onceMock).toHaveBeenCalledWith("ready", expect.any(Function));
    });

    it("should resolve on timeout on onModuleInit when ready event is not emitted", async () => {
      const originalSetTimeout = globalThis.setTimeout;
      const setTimeoutMock = mock((cb: () => void) => {
        cb();
        return 0 as unknown as ReturnType<typeof setTimeout>;
      });
      globalThis.setTimeout = setTimeoutMock as unknown as typeof setTimeout;

      try {
        Object.defineProperty(redlockService, "redisClient", {
          value: {
            status: "connecting",
            on: mock(() => undefined),
            once: mock(() => undefined),
          },
          configurable: true,
        });

        await redlockService.onModuleInit();
        expect(setTimeoutMock).toHaveBeenCalled();
      } finally {
        globalThis.setTimeout = originalSetTimeout;
      }
    });

    it("should handle onModuleDestroy gracefully when client is disconnected or ready", async () => {
      const mockQuit = mock(() => Promise.resolve("OK"));
      const mockDisconnect = mock(() => undefined);

      Object.defineProperty(redlockService, "redisClient", {
        value: {
          status: "ready",
          quit: mockQuit,
          disconnect: mockDisconnect,
        },
        configurable: true,
      });

      await redlockService.onModuleDestroy();
      expect(mockQuit).toHaveBeenCalledTimes(1);
    });

    it("should catch and suppress teardown errors during onModuleDestroy when redis quit throws", async () => {
      const mockQuit = mock(() => Promise.reject(new Error("Socket closed")));

      Object.defineProperty(redlockService, "redisClient", {
        value: {
          status: "ready",
          quit: mockQuit,
        },
        configurable: true,
      });

      await redlockService.onModuleDestroy();
    });
  });

  describe("when acquiring and releasing distributed locks", () => {
    it("should acquire lock successfully when resources are available", async () => {
      const mockLock = createMockLock(["lock:seat:1"]);
      const spyAcquire = mock(() => Promise.resolve(mockLock));

      Object.defineProperty(redlockService, "redlock", {
        value: { acquire: spyAcquire },
        configurable: true,
      });

      const lock = await redlockService.acquireLock(["lock:seat:1"], 2000);
      expect(lock).toBeDefined();
      expect(spyAcquire).toHaveBeenCalledWith(["lock:seat:1"], 2000);
    });

    it("should record error breadcrumb and rethrow exception when lock acquisition fails", async () => {
      const addBreadcrumbMock = mock(() => undefined);
      const mockSentryService = {
        addBreadcrumb: addBreadcrumbMock,
      } as unknown as SentryService;

      const serviceWithSentry = new RedlockService(
        configService,
        mockSentryService,
      );

      const lockError = new Error("Resource is locked");
      const spyAcquire = mock(() => Promise.reject(lockError));

      Object.defineProperty(serviceWithSentry, "redlock", {
        value: { acquire: spyAcquire },
        configurable: true,
      });

      let thrownError: unknown;
      try {
        await serviceWithSentry.acquireLock(["lock:seat:busy"], 2000);
      } catch (err) {
        thrownError = err;
      }
      expect(thrownError).toBe(lockError);
      expect(addBreadcrumbMock).toHaveBeenCalledWith(
        expect.objectContaining({
          category: SENTRY_BREADCRUMB_CATEGORY.REDLOCK,
          level: "warning",
          message: "Failed to acquire lock for [lock:seat:busy]",
        }),
      );

      await serviceWithSentry.onModuleDestroy();
    });

    it("should release lock successfully when lock is valid", async () => {
      const releaseMock = mock(() => Promise.resolve({ attempts: [] }));
      const mockLock = createMockLock(
        ["lock:seat:1"],
        releaseMock as unknown as () => Promise<never>,
      );
      await redlockService.releaseLock(mockLock);
      expect(releaseMock).toHaveBeenCalledTimes(1);
    });

    it("should release lock gracefully and catch errors silently when lock release fails", async () => {
      const releaseMock = mock(() => Promise.reject(new Error("Lock expired")));
      const mockLock = createMockLock(["lock:seat:1"], releaseMock);

      await redlockService.releaseLock(mockLock);
      expect(releaseMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("when integrating with Sentry observability", () => {
    it("should record Sentry breadcrumbs during lock acquisition and release when SentryService is provided", async () => {
      const addBreadcrumbMock = mock(() => undefined);
      const mockSentryService = {
        addBreadcrumb: addBreadcrumbMock,
      } as unknown as SentryService;

      const serviceWithSentry = new RedlockService(
        configService,
        mockSentryService,
      );

      const mockLock = createMockLock(["lock:seat:2"]);
      const spyAcquire = mock(() => Promise.resolve(mockLock));

      Object.defineProperty(serviceWithSentry, "redlock", {
        value: { acquire: spyAcquire },
        configurable: true,
      });

      const lock = await serviceWithSentry.acquireLock(["lock:seat:2"], 3000);
      expect(lock).toBeDefined();
      expect(addBreadcrumbMock).toHaveBeenCalledWith(
        expect.objectContaining({
          category: SENTRY_BREADCRUMB_CATEGORY.REDLOCK,
          level: "info",
        }),
      );

      await serviceWithSentry.releaseLock(mockLock);
      expect(addBreadcrumbMock).toHaveBeenCalledWith(
        expect.objectContaining({
          category: SENTRY_BREADCRUMB_CATEGORY.REDLOCK,
          message: "Released lock for [lock:seat:2]",
        }),
      );

      await serviceWithSentry.onModuleDestroy();
    });
  });
});
