import { sql } from "drizzle-orm";
import { readdir, rm } from "node:fs/promises";
import { join } from "path";
import { createHash } from "crypto";
import { execSync } from "child_process";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

async function forceBaseline() {
  const dbUrl = process.env["DB_URL"];
  if (!dbUrl) {
    console.error("Missing required environment variable: DB_URL");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: dbUrl });
  const db = drizzle({ client: pool });
  const injectOnly = process.argv.includes("--inject-only");
  console.log(
    injectOnly
      ? "Initializing Automated Baselining Protocol (Injection Only)..."
      : "Initializing Automated Baselining Protocol...",
  );

  const drizzleDir = join(process.cwd(), "drizzle");

  if (!injectOnly) {
    // 1. Clean up old migration directories except drizzle.config.ts / meta if any
    console.log("Purging existing migration directories...");
    const entries = await readdir(drizzleDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && /^\d{14}/.test(entry.name)) {
        await rm(join(drizzleDir, entry.name), {
          recursive: true,
          force: true,
        });
      }
    }

    // Also remove meta folder to prevent drizzle-kit from trying to calculate incremental diffs
    await rm(join(drizzleDir, "meta"), { recursive: true, force: true });

    // 2. Generate a single fresh baseline migration
    console.log("Generating consolidated fresh baseline migration...");
    execSync("bun run db:generate", { stdio: "inherit" });
  }

  // 3. Read the newly generated migration folder
  const entriesAfterGen = await readdir(drizzleDir, { withFileTypes: true });
  const migrationFoldersAfterGen = entriesAfterGen
    .filter((dirent) => dirent.isDirectory() && /^\d{14}/.test(dirent.name))
    .map((dirent) => dirent.name)
    .sort((a, b) => a.localeCompare(b));

  const latestMigrationName = migrationFoldersAfterGen.at(-1);

  if (!latestMigrationName) {
    console.error("No migration directory found after generation.");
    process.exit(1);
  }

  const sqlFilePath = join(drizzleDir, latestMigrationName, "migration.sql");
  const fullSqlContent = await Bun.file(sqlFilePath).text();
  const hash = createHash("sha256").update(fullSqlContent).digest("hex");
  const createdAt = Date.now();

  console.log(
    `Injecting Consolidated Migration Record: ${latestMigrationName}`,
  );
  try {
    await db.execute(sql`CREATE SCHEMA IF NOT EXISTS "drizzle";`);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint,
        name text,
        applied_at timestamp with time zone DEFAULT now()
      );
    `);
    await db.transaction(async (tx) => {
      await tx.execute(sql`
        TRUNCATE TABLE "drizzle"."__drizzle_migrations" RESTART IDENTITY;
      `);
      await tx.execute(sql`
        INSERT INTO "drizzle"."__drizzle_migrations" (hash, created_at, name, applied_at)
        VALUES (${hash}, ${createdAt}, ${latestMigrationName}, NOW());
      `);
    });
    console.log(
      "Baselining Complete! Migration record injected & synced in __drizzle_migrations.",
    );
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("Fatal Error during injection:", error);
    await pool.end();
    process.exit(1);
  }
}

await forceBaseline();
