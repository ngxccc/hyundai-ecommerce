import { describe, expect, it, mock } from "bun:test";
import { Pool } from "pg";
import {
  createDatabasePool,
  createDrizzleClient,
  normalizeDatabaseUrl,
} from "./database.connection";

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
});
