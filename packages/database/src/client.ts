import { Pool as NeonPool } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { env } from "./env";
import * as schema from "./schemas";

type DatabaseType = ReturnType<
  typeof drizzleNeon<typeof schema.schemaRelations>
>;

const globalForDb = globalThis as unknown as {
  dbInstance: DatabaseType | undefined;
};

let dbInstance: unknown = globalForDb.dbInstance;

if (!dbInstance) {
  const pool = new NeonPool({ connectionString: env.DATABASE_URL });
  dbInstance = drizzleNeon({
    client: pool,
    relations: schema.schemaRelations,
    jit: true,
    // logger: process.env.NODE_ENV !== "production",
  });
  if (process.env.NODE_ENV !== "production") {
    globalForDb.dbInstance = dbInstance as DatabaseType;
  }
}

export const db = dbInstance as DatabaseType;

export type TDatabase = typeof db;
export type TTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type IDatabase = TDatabase | TTransaction;

export async function withTransaction(
  callback: Parameters<typeof db.transaction>[0],
): Promise<Awaited<ReturnType<Parameters<typeof db.transaction>[0]>>> {
  return await db.transaction(async (tx) => {
    try {
      return await callback(tx);
    } catch (error) {
      console.error("[DB Transaction Error]", error);
      throw error;
    }
  });
}
