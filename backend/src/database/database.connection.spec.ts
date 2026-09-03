import { describe, expect, it, mock } from "bun:test";
import { Pool } from "pg";
import {
  clearSchemaTablesCache,
  createDatabasePool,
  createDrizzleClient,
  normalizeDatabaseUrl,
  truncateAllTables,
} from "./database.connection";
import type { DrizzleDB } from "./database.module";

describe("Database Connection Utility", () => {
  describe("normalizeDatabaseUrl", () => {
    it("should return undefined if rawUrl is undefined or empty", () => {
      expect(normalizeDatabaseUrl(undefined)).toBeUndefined();
      expect(normalizeDatabaseUrl("")).toBeUndefined();
    });

    it("should strip -pooler. subdomain and map legacy sslmode to verify-full", () => {
      const input =
        "postgresql://user:pass@ep-xyz-pooler.ap-southeast-1.aws.neon.tech/db?sslmode=require";
      const normalized = normalizeDatabaseUrl(input);

      expect(normalized).toBe(
        "postgresql://user:pass@ep-xyz.ap-southeast-1.aws.neon.tech/db?sslmode=verify-full",
      );
    });

    it("should map prefer and verify-ca sslmodes to verify-full", () => {
      expect(
        normalizeDatabaseUrl("postgres://localhost:5432/db?sslmode=prefer"),
      ).toBe("postgres://localhost:5432/db?sslmode=verify-full");
      expect(
        normalizeDatabaseUrl("postgres://localhost:5432/db?sslmode=verify-ca"),
      ).toBe("postgres://localhost:5432/db?sslmode=verify-full");
    });
  });

  describe("createDatabasePool", () => {
    it("should instantiate Pool with connectionString when customUrl or env.DB_URL is provided", () => {
      const pool = createDatabasePool(
        { max: 5 },
        "postgresql://custom:pass@localhost:5432/custom_db",
      );

      expect(pool).toBeInstanceOf(Pool);
      void pool.end();
    });

    it("should fallback to discrete host/port configuration when dbUrl is undefined", () => {
      const pool = createDatabasePool({ max: 5 }, "");

      expect(pool).toBeInstanceOf(Pool);
      void pool.end();
    });
  });

  describe("createDrizzleClient", () => {
    it("should create typesafe Drizzle client with schema relations", () => {
      const pool = createDatabasePool();
      const mockLogger = { logQuery: mock() };
      const db = createDrizzleClient(pool, mockLogger);

      expect(db).toBeDefined();
      expect(typeof db.select).toBe("function");
      void pool.end();
    });
  });

  describe("truncateAllTables and clearSchemaTablesCache", () => {
    it("should throw safety error if invoked in production environment", async () => {
      const originalEnv = process.env.NODE_ENV;
      try {
        process.env.NODE_ENV = "production";
        const mockDb = {} as DrizzleDB;

        let thrown: Error | null = null;
        try {
          await truncateAllTables(mockDb);
        } catch (e) {
          thrown = e as Error;
        }

        expect(thrown).toBeDefined();
        expect(thrown?.message).toMatch(/Safety Guard Violation/i);
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });

    it("should query pg_tables, cache table names, and execute TRUNCATE query", async () => {
      clearSchemaTablesCache("test_cache_schema");

      const executeMock = mock(
        (queryObj: { queryChunks?: { value?: string }[] }) => {
          const chunkVal = queryObj.queryChunks?.[0]?.value ?? "";
          if (chunkVal.includes("TRUNCATE TABLE")) {
            return Promise.resolve({ rows: [] });
          }
          return Promise.resolve({
            rows: [
              { tablename: "users" },
              { tablename: "movies" },
              { tablename: "__drizzle_migrations" },
            ],
          });
        },
      );

      const mockDb = {
        execute: executeMock,
      } as unknown as DrizzleDB;

      // 1. First execution populates cache
      await truncateAllTables(mockDb, "test_cache_schema");
      expect(executeMock.mock.calls.length).toBe(2);

      const truncateCall = executeMock.mock.calls[1]?.[0];
      expect(truncateCall?.queryChunks?.[0]?.value).toContain(
        'TRUNCATE TABLE "test_cache_schema"."users", "test_cache_schema"."movies" RESTART IDENTITY CASCADE;',
      );

      // 2. Second execution hits cache (does not re-query pg_tables)
      executeMock.mockClear();
      await truncateAllTables(mockDb, "test_cache_schema");
      expect(executeMock.mock.calls.length).toBe(1);

      // 3. Clear cache by schema and verify re-query
      clearSchemaTablesCache("test_cache_schema");
      executeMock.mockClear();
      await truncateAllTables(mockDb, "test_cache_schema");
      expect(executeMock.mock.calls.length).toBe(2);

      // 4. Clear all caches
      clearSchemaTablesCache();
    });

    it("should return early without executing TRUNCATE if no application tables exist", async () => {
      clearSchemaTablesCache("empty_schema");

      const executeMock = mock(() => {
        return Promise.resolve({ rows: [] });
      });

      const mockDb = {
        execute: executeMock,
      } as unknown as DrizzleDB;

      await truncateAllTables(mockDb, "empty_schema");
      expect(executeMock.mock.calls.length).toBe(1);
    });
  });
});
