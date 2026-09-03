import { sql } from "drizzle-orm";
import { readdir, rm } from "node:fs/promises";
import { join } from "path";
import { createHash } from "crypto";
import { execSync } from "child_process";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "@/app.module";
import {
  DATABASE_CONNECTION,
  type DrizzleDB,
} from "@/database/database.module";

async function forceBaseline() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const db = app.get<DrizzleDB>(DATABASE_CONNECTION);

  const injectOnly = process.argv.includes("--inject-only");
  console.log(
    injectOnly
      ? "Initializing Automated Baselining Protocol (Injection Only)..."
      : "Initializing Automated Baselining Protocol...",
  );

  const drizzleDir = join(process.cwd(), "drizzle");

  if (!injectOnly) {
    // 1. Delete all existing migration folders
    try {
      const entries = await readdir(drizzleDir, { withFileTypes: true });
      const migrationFolders = entries
        .filter((dirent) => dirent.isDirectory() && /^\d{14}/.test(dirent.name))
        .map((dirent) => dirent.name);

      for (const folder of migrationFolders) {
        console.log(`Cleaning up old migration folder: ${folder}`);
        await rm(join(drizzleDir, folder), { recursive: true, force: true });
      }
    } catch {
      console.log("No existing drizzle directory or folders to clean up.");
    }

    // 2. Automatically generate the new consolidated migration
    console.log("Generating consolidated drizzle migration...");
    try {
      execSync("bun run db:generate", {
        stdio: "inherit",
      });
    } catch (error) {
      console.error("Failed to generate migration via drizzle-kit:", error);
      process.exit(1);
    }
  }
  // 3. Read the newly generated migration folder
  const entriesAfterGen = await readdir(drizzleDir, { withFileTypes: true });
  const migrationFoldersAfterGen = entriesAfterGen
    .filter((dirent) => dirent.isDirectory() && /^\d{14}/.test(dirent.name))
    .map((dirent) => dirent.name)
    .sort((a, b) => a.localeCompare(b));

  const latestMigrationName = migrationFoldersAfterGen.at(-1);

  if (!latestMigrationName) {
    console.error("No migration folders found after generation.");
    process.exit(1);
  }

  const sqlFilePath = join(drizzleDir, latestMigrationName, "migration.sql");
  const customSql = `
CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA public;--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.show_occupied_range(start_t timestamptz, end_t timestamptz)
RETURNS tstzrange AS $$
  SELECT tstzrange(start_t, end_t + interval '15 minutes', '[)');
$$ LANGUAGE sql IMMUTABLE;--> statement-breakpoint
ALTER TABLE "shows" DROP CONSTRAINT IF EXISTS "no_hall_schedule_overlap";--> statement-breakpoint
ALTER TABLE "shows" ADD CONSTRAINT "no_hall_schedule_overlap"
EXCLUDE USING gist (
  hall_id WITH =,
  public.show_occupied_range(start_time, end_time) WITH &&
);
`;
  const existingContent = await Bun.file(sqlFilePath).text();
  const shouldAppend = !existingContent.includes("show_occupied_range");
  const fullSqlContent = shouldAppend
    ? existingContent + customSql
    : existingContent;

  if (shouldAppend) {
    await Bun.write(sqlFilePath, fullSqlContent);
  }
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
    process.exit(0);
  } catch (error) {
    console.error("Fatal Error during injection:", error);
    process.exit(1);
  }
}

await forceBaseline();
