import { Pool as NeonPool } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import { env } from "./env";
import * as schema from "./schemas";
import postgres from "postgres";

const isCI = process.env["CI"] !== undefined;

type DatabaseType = ReturnType<
  typeof drizzleNeon<typeof schema.schemaRelations>
>;

let dbInstance;

if (!isCI) {
  const pool = new NeonPool({ connectionString: env.DATABASE_URL });
  dbInstance = drizzleNeon({
    client: pool,
    relations: schema.schemaRelations,
    jit: true,
  });
} else {
  const queryClient = postgres(env.DATABASE_URL);
  dbInstance = drizzlePg({
    client: queryClient,
    relations: schema.schemaRelations,
    jit: true,
  });
}

export const db = dbInstance as DatabaseType;

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
