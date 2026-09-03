import { Pool, type PoolConfig } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import type { Logger as DrizzleLogger } from "drizzle-orm/logger";
import { sql } from "drizzle-orm";
import { env } from "@/env";
import * as schema from "./schemas";
import type { DrizzleDB } from "./database.module";

const schemaTablesCache = new Map<string, string[]>();

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
 * Creates a typesafe Drizzle ORM client instance with schema relations and JIT compilation enabled.
 *
 * @param pool - PostgreSQL connection pool client
 * @param logger - Optional Drizzle query logger instance
 * @returns Strongly typed DrizzleDB instance
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

/**
 * Dynamically truncates all application tables within a target schema with cascading identity reset.
 * Automatically discovers tables via `pg_tables` (excluding migration metadata) to remain resilient to schema additions.
 *
 * @param db - Drizzle database client instance
 * @param schemaName - Target PostgreSQL schema name (defaults to "public")
 * @throws Error if invoked in a production environment
 */
export async function truncateAllTables(
  db: DrizzleDB,
  schemaName = "public",
): Promise<void> {
  const nodeEnv = process.env.NODE_ENV ?? env.NODE_ENV;
  if (nodeEnv === "production") {
    throw new Error(
      "Safety Guard Violation: Table truncation is strictly prohibited in production environment!",
    );
  }

  let tables = schemaTablesCache.get(schemaName);
  if (!tables) {
    const result = await db.execute(
      sql`SELECT tablename FROM pg_tables WHERE schemaname = ${schemaName};`,
    );
    tables = (result.rows as { tablename: string }[])
      .map((r: { tablename: string }) => r.tablename)
      .filter((t: string) => t !== "__drizzle_migrations");
    schemaTablesCache.set(schemaName, tables);
  }

  if (tables.length === 0) return;

  const query = `TRUNCATE TABLE ${tables.map((t) => `"${schemaName}"."${t}"`).join(", ")} RESTART IDENTITY CASCADE;`;
  await db.execute(sql.raw(query));
}

/**
 * Clears the cached table names for a schema or all schemas.
 *
 * @param schemaName - Optional specific schema name to clear
 */
export function clearSchemaTablesCache(schemaName?: string): void {
  if (schemaName) {
    schemaTablesCache.delete(schemaName);
  } else {
    schemaTablesCache.clear();
  }
}
