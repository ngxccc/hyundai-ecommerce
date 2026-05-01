import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "./env";
import * as schema from "./schemas";

// Khởi tạo kết nối Serverless.
// Tại sao dùng HTTP thay vì TCP? Vì Next.js Serverless Functions scale up liên tục,
// dùng TCP sẽ cạn kiệt Connection Pool của Database. HTTP giải quyết bài toán này.
const sql = neon(env.DATABASE_URL);
export const db = drizzle({
  client: sql,
  schema,
  casing: "snake_case",
  relations: schema.schemaRelations,
});

export async function withTransaction<T>(
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
