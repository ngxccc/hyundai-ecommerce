import { Test, type TestingModule } from "@nestjs/testing";
import { type INestApplication } from "@nestjs/common";
import type Redis from "ioredis";
import Redlock, { type Lock } from "redlock";
import { AppModule } from "@/app.module";
import { MailService } from "@/modules/mail/mail.service";
import {
  RedlockService,
  DEFAULT_REDLOCK_OPTIONS,
} from "@/common/services/redlock.service";
import {
  DATABASE_CONNECTION,
  type DrizzleDB,
} from "@/database/database.module";
import {
  createWorkerTestDatabase,
  teardownWorkerTestDatabase,
  type TestDatabaseContext,
} from "./database.helper";
import { createRedisClient } from "@/config/redis.config";
import { ZodValidationPipe } from "@/common/pipes/zod-validation.pipe";

/**
 * Encapsulates the runtime application and isolated resources provisioned for a test suite.
 */
export interface TestAppSetup {
  app: INestApplication;
  db: DrizzleDB;
  dbContext: TestDatabaseContext;
  redisClient: Redis;
  workerSchema: string;
}

export interface CreateTestAppOptions {
  schemaName?: string;
  dbContext?: TestDatabaseContext;
}

/**
 * Non-blocking cleanup of Redis keys matching a prefix pattern using SCAN and UNLINK.
 *
 * @param redis - Redis client instance
 */
export async function cleanScopedRedisKeys(redis: Redis): Promise<void> {
  const prefix = redis.options.keyPrefix ?? "";
  let cursor = "0";

  try {
    do {
      const [nextCursor, keys] = await redis.scan(
        cursor,
        "MATCH",
        "*",
        "COUNT",
        500,
      );
      cursor = nextCursor;

      if (keys.length > 0) {
        // Strip keyPrefix before calling unlink because ioredis automatically re-applies it to arguments.
        const strippedKeys = prefix
          ? keys.map((k) => (k.startsWith(prefix) ? k.slice(prefix.length) : k))
          : keys;
        await redis.unlink(...strippedKeys).catch(() => undefined);
      }
    } while (cursor !== "0");
  } catch {
    // Fail-open: ignore Redis cleanup errors if Redis server is offline during test teardown.
  }
}

/**
 * Provisions a fully isolated NestJS test application with a dedicated PostgreSQL worker schema
 * and scoped Redis keyPrefix.
 *
 * @param options - Optional configuration overrides
 */
export async function createTestApp(
  options?: CreateTestAppOptions,
): Promise<TestAppSetup> {
  const dbContext =
    options?.dbContext ??
    (await createWorkerTestDatabase(undefined, options?.schemaName));
  const workerSchema = dbContext.schemaName;

  const redisClient = createRedisClient({
    keyPrefix: `test:${workerSchema}:`,
  });

  redisClient.on("error", () => undefined);

  if (redisClient.status !== "ready") {
    await new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, 2000);
      const onReady = () => {
        clearTimeout(timer);
        resolve();
      };
      if (redisClient.status === "ready") {
        onReady();
      } else {
        redisClient.once("ready", onReady);
      }
    });
  }
  const redlock = new Redlock([redisClient], DEFAULT_REDLOCK_OPTIONS);

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(DATABASE_CONNECTION)
    .useValue(dbContext.db)
    .overrideProvider(RedlockService)
    .useValue({
      getRedisClient: () => redisClient,
      acquireLock: async (resources: string[], ttl = 2000): Promise<Lock> =>
        redlock.acquire(resources, ttl),
      releaseLock: async (lock: Lock): Promise<void> => {
        try {
          await lock.release();
        } catch {
          // Silent catch if lock expired or was already released.
        }
      },
      onModuleInit: async () => Promise.resolve(),
      onModuleDestroy: async () => Promise.resolve(),
    })
    .overrideProvider(MailService)
    .useValue({
      sendVerificationEmail: async () => Promise.resolve(),
      sendPasswordResetEmail: async () => Promise.resolve(),
    })
    .compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ZodValidationPipe());
  await app.init();

  const db = dbContext.db;

  return {
    app,
    db,
    dbContext,
    redisClient,
    workerSchema,
  };
}

/**
 * Gracefully tears down a test application, purges scoped Redis keys, and drops the worker database schema.
 *
 * @param setup - The test application context to tear down
 */
export async function teardownTestApp(setup?: TestAppSetup): Promise<void> {
  if (!setup) return;
  await cleanScopedRedisKeys(setup.redisClient);
  await setup.redisClient.quit().catch(() => {
    setup.redisClient.disconnect();
  });
  await setup.app.close();
  await teardownWorkerTestDatabase(setup.dbContext);
}
