import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { env } from "./env";
import * as schema from "./schemas";

const pool = new Pool({ connectionString: env.DATABASE_URL });
export const db = drizzle({
  client: pool,
  relations: schema.schemaRelations,
  jit: true,
});

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
