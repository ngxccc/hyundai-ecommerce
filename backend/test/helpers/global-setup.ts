import "@nestjs/core";
import "@nestjs/testing";
import type { Pool } from "pg";
import { env } from "@/env";
import { TIME_IN_MS } from "@/common/constants/time.constant";
import { Logger } from "@nestjs/common";
import { spyOn } from "bun:test";
import {
  createTestPool,
  dropTestSchema,
  ensureTemplateSchemaMigrated,
} from "./database.helper";

// Suppress intentional NestJS log noise during unit test suites to keep terminal output clean.
spyOn(Logger.prototype, "error").mockImplementation(() => undefined);
spyOn(Logger.prototype, "warn").mockImplementation(() => undefined);
spyOn(Logger.prototype, "log").mockImplementation(() => undefined);
spyOn(Logger.prototype, "debug").mockImplementation(() => undefined);
spyOn(Logger.prototype, "verbose").mockImplementation(() => undefined);
export const ORPHAN_SCHEMA_MAX_AGE_MS = TIME_IN_MS.HOUR;

/**
 * Sweeps and purges leftover test schemas from crashed or interrupted test executions.
 *
 * @param pool - Active PostgreSQL connection pool
 */
export async function cleanupOrphanTestSchemas(pool: Pool): Promise<void> {
  const result = await pool.query<{ schema_name: string }>(
    "SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 'test_%';",
  );

  const now = Date.now();
  for (const row of result.rows) {
    const match = /^test_(\d+)_[a-f0-9_]+$/.exec(row.schema_name);
    if (!match) continue;

    const rawTimestamp = match[1];
    if (!rawTimestamp) continue;

    const schemaTimestamp = parseInt(rawTimestamp, 10);
    if (isNaN(schemaTimestamp)) continue;

    if (now - schemaTimestamp > ORPHAN_SCHEMA_MAX_AGE_MS) {
      await dropTestSchema(pool, row.schema_name);
    }
  }
}

/**
 * Global pre-flight initialization hook executed before parallel test workers spawn.
 * Fails open gracefully if the database is unreachable (e.g. during unit test runs).
 */
let isGlobalEnvInitialized = false;

export async function setupGlobalTestEnvironment(): Promise<void> {
  if (env.NODE_ENV === "production" || process.env.NODE_ENV === "production") {
    throw new Error(
      "Safety Guard Violation: Test suite execution is strictly prohibited against production environment.",
    );
  }

  if (env.NODE_ENV !== "test" || !env.DB_URL || isGlobalEnvInitialized) return;

  // Only execute database pre-flight checks if the test suite is an integration/e2e test under test/
  const isRunningIntegrationTest = process.argv.some(
    (arg) =>
      arg.includes("test/") ||
      arg.includes(".e2e") ||
      arg.includes(".integration"),
  );

  if (!isRunningIntegrationTest) {
    return;
  }

  isGlobalEnvInitialized = true;
  const pool = createTestPool({ max: 2 });
  try {
    await pool.query(
      "CREATE EXTENSION IF NOT EXISTS btree_gist SCHEMA public;",
    );

    // Migrate template schema once to eliminate per-worker DDL execution overhead
    await ensureTemplateSchemaMigrated(pool);

    await cleanupOrphanTestSchemas(pool);
  } catch {
    // Fail-open gracefully if DB is temporarily unreachable in non-DB unit test environments
  } finally {
    await pool.end().catch(() => undefined);
  }
}

// Bunfig preload executes this file before worker suites spawn; top-level await guarantees pre-flight completion.
await setupGlobalTestEnvironment();
