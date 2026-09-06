import { sql } from "drizzle-orm";
import type { DrizzleDB } from "../database.module";
import { env } from "@/env";

const schemaTablesCache = new Map<string, string[]>();

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
  if (env.NODE_ENV === "production") {
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
