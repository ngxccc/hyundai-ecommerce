import { Pool, type PoolConfig } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import type { Logger as DrizzleLogger } from "drizzle-orm/logger";
import { env } from "@/env";
import * as schema from "./schemas";
import type { DrizzleDB } from "./database.module";

/**
 * Normalizes PostgreSQL database connection URLs by mapping legacy SSL modes to 'sslmode=verify-full'
 * and stripping cloud connection pooler subdomains when unpooled direct connections are required.
 *
 * @param rawUrl - Optional raw PostgreSQL connection string
 * @returns Normalized URL string, or undefined if no URL is provided
 */
export function normalizeDatabaseUrl(rawUrl?: string): string | undefined {
  if (!rawUrl) return undefined;
  return rawUrl
    .replace("-pooler.", ".")
    .replace(/sslmode=(require|prefer|verify-ca)/gi, "sslmode=verify-full");
}

/**
 * Creates and configures a PostgreSQL connection pool using validated environment variables or custom overrides.
 *
 * @param overrides - Optional PoolConfig overrides (e.g. max connections, search_path)
 * @param customUrl - Optional custom database URL override
 * @returns Configured PostgreSQL Pool instance
 */
export function createDatabasePool(
  overrides?: PoolConfig,
  customUrl?: string,
): Pool {
  const dbUrl = normalizeDatabaseUrl(customUrl ?? env.DB_URL);

  return dbUrl
    ? new Pool({
        connectionString: dbUrl,
        connectionTimeoutMillis: 5000,
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
        max: 20,
        ...overrides,
      })
    : new Pool({
        host: env.DB_HOST,
        port: env.DB_PORT,
        user: env.DB_USERNAME,
        password: env.DB_PASSWORD,
        database: env.DB_DATABASE,
        connectionTimeoutMillis: 5000,
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
        max: 20,
        ...overrides,
      });
}

/**
 * Instantiates the primary Drizzle ORM client wrapped with query profiling and schema relationships.
 *
 * @param pool - Initialized pg connection pool
 * @param logger - Optional Drizzle query logger
 * @returns Drizzle database instance
 */
export function createDrizzleClient(
  pool: Pool,
  logger?: DrizzleLogger,
): DrizzleDB {
  return drizzle({
    client: pool,
    relations: schema.schemaRelations,
    logger,
    jit: true,
  }) as unknown as DrizzleDB;
}
