import { describe, expect, it, mock } from "bun:test";
import { truncateAllTables, clearSchemaTablesCache } from "./truncate.util";
import type { DrizzleDB } from "../database.module";
import { env } from "@/env";

describe("Database Table Truncation Utility", () => {
  it("should throw safety error if invoked in production environment", async () => {
    const originalEnv = env.NODE_ENV;
    try {
      (env as { NODE_ENV: string }).NODE_ENV = "production";
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
      (env as { NODE_ENV: string }).NODE_ENV = originalEnv;
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
            { tablename: "products" },
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
      'TRUNCATE TABLE "test_cache_schema"."users", "test_cache_schema"."products" RESTART IDENTITY CASCADE;',
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
