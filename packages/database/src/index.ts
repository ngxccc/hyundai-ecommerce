import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "./env";
import * as schema from "./schemas";

// Khởi tạo kết nối Serverless.
// Tại sao dùng HTTP thay vì TCP? Vì Next.js Serverless Functions scale up liên tục,
// dùng TCP sẽ cạn kiệt Connection Pool của Database. HTTP giải quyết bài toán này.
const sql = neon(env.DATABASE_URL);
export const db = drizzle(sql, { schema });

export * from "./schemas";
export * from "drizzle-orm";
