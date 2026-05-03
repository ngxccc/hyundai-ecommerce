import { db } from "../src/index";
import { sql } from "drizzle-orm";
import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { createHash } from "crypto";

async function forceBaseline() {
  console.log("Initializing Automated Baselining Protocol...");

  const drizzleDir = join(process.cwd(), "drizzle");
  const entries = await readdir(drizzleDir, { withFileTypes: true });

  const migrationFolders = entries
    .filter((dirent) => dirent.isDirectory() && /^\d{14}/.test(dirent.name))
    .map((dirent) => dirent.name)
    .sort((a, b) => a.localeCompare(b));

  const latestMigrationName = migrationFolders.at(-1);

  if (!latestMigrationName) {
    console.error("No migration folders found.");
    process.exit(1);
  }

  const sqlFilePath = join(drizzleDir, latestMigrationName, "migration.sql");
  const sqlContent = await readFile(sqlFilePath, "utf-8");

  const hash = createHash("sha256").update(sqlContent).digest("hex");
  const createdAt = Date.now();

  console.log(`Injecting Mega Migration: ${latestMigrationName}`);

  try {
    /**
     * BUG: Risk of Split-Brain state if ran outside of controlled deployment workflows.
     * TODO: Implement environment guards (e.g., if (process.env.NODE_ENV !== "development") throw Error) to prevent accidental wipe on production.
     */
    await db.transaction(async (tx) => {
      await tx.execute(sql`
        TRUNCATE TABLE "drizzle"."__drizzle_migrations" RESTART IDENTITY;
      `);

      await tx.execute(sql`
        INSERT INTO "drizzle"."__drizzle_migrations" (hash, created_at, name, applied_at)
        VALUES (${hash}, ${createdAt}, ${latestMigrationName}, NOW());
      `);
    });

    console.log("Baselining Complete! DB state synced.");
    process.exit(0);
  } catch (error) {
    console.error("Fatal Error during injection:", error);
    process.exit(1);
  }
}

await forceBaseline();
