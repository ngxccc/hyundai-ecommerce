import { Pool } from "pg";

const dbUrl = process.env["DB_URL"];
if (!dbUrl) {
  console.error("Missing required environment variable: DB_URL");
  process.exit(1);
}

const pool = new Pool({ connectionString: dbUrl });

try {
  console.log("Resetting public schema and drizzle migration metadata...");
  await pool.query("DROP SCHEMA IF EXISTS drizzle CASCADE;");
  await pool.query("DROP SCHEMA IF EXISTS public CASCADE;");
  await pool.query("CREATE SCHEMA public;");
  await pool.query("GRANT ALL ON SCHEMA public TO public;");
  await pool.query("COMMENT ON SCHEMA public IS 'standard public schema';");
  console.log("✅ Database schema cleanly reset!");
} catch (error) {
  console.error("❌ Failed to reset database:", error);
  process.exit(1);
} finally {
  await pool.end();
}
