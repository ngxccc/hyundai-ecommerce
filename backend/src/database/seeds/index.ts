import { parseArgs } from "node:util";
import type { Pool } from "pg";
import {
  createDatabasePool,
  createDrizzleClient,
  truncateAllTables,
} from "../database.connection";
import type { DrizzleDB } from "../database.module";
import {
  SEED_SCOPES,
  normalizeSeedScopes,
  type SeedScope,
} from "./constants/seed.constant";
import { seedDatabase } from "./seed.orchestrator";

/**
 * Parses and validates CLI arguments passed to the seeding command.
 */
function parseCliArgs() {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      scope: {
        type: "string",
        short: "s",
        default: "all",
      },
      reset: {
        type: "boolean",
        short: "r",
        default: false,
      },
      clean: {
        type: "boolean",
        short: "c",
        default: false,
      },
      help: {
        type: "boolean",
        short: "h",
        default: false,
      },
    },
    allowPositionals: false,
    strict: false,
  });

  if (values.help) {
    printHelp();
    process.exit(0);
  }

  const rawScope = typeof values.scope === "string" ? values.scope : undefined;
  let normalizedScopes: SeedScope[];
  try {
    normalizedScopes = normalizeSeedScopes(rawScope);
  } catch (error) {
    console.error(
      `\x1b[31m[ERROR]\x1b[0m ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  }

  return {
    scopes: normalizedScopes,
    reset: Boolean(values.reset),
    clean: Boolean(values.clean),
  };
}

/**
 * Prints usage and available options for the seeding CLI.
 */
function printHelp(): void {
  console.log(`
    \x1b[1m\x1b[36m=== Hyundai E-Commerce Database Seeding Engine ===\x1b[0m

\x1b[1mUSAGE:\x1b[0m
  $ bun run db:seed [options]
  $ doppler run -- bun src/database/seeds/index.ts [options]

\x1b[1mOPTIONS:\x1b[0m
  -s, --scope <scope>   Select seeding scope (default: "all")
                        Supports single scope or comma-separated scopes:
                        ${SEED_SCOPES.join(", ")}
  -r, --reset           Truncate existing data before seeding (Strictly blocked in production)
  -c, --clean           Truncate all application data without re-seeding (Blocked in production)
  -h, --help            Display this help message

\x1b[1mEXAMPLES:\x1b[0m
  $ bun run db:seed
  $ bun run db:seed --scope=reference
  $ bun run db:seed --scope=dealer-tiers,users
  $ bun run db:seed --scope=catalog,brands,categories,products
  $ bun run db:seed --scope=operational,quotes,orders
  $ bun run db:seed --reset
  $ bun run db:seed --clean
`);
}

/**
 * Initializes a standalone database connection pool for CLI execution using validated env configuration.
 */
function createCliDatabaseConnection(): { pool: Pool; db: DrizzleDB } {
  const pool = createDatabasePool();
  const db = createDrizzleClient(pool);
  return { pool, db };
}

/**
 * Main CLI entrypoint.
 */
async function main(): Promise<void> {
  const args = parseCliArgs();
  const { pool, db } = createCliDatabaseConnection();

  try {
    if (args.clean) {
      console.log(
        `\n\x1b[1m\x1b[34m[CLEAN]\x1b[0m Truncating all application database tables...`,
      );
      await truncateAllTables(db);
      console.log(
        `\n\x1b[1m\x1b[32m[SUCCESS]\x1b[0m All application database tables truncated and cleaned successfully.\n`,
      );
      return;
    }

    console.log(
      `\n\x1b[1m\x1b[34m[SEED]\x1b[0m Starting database seeding (scope: \x1b[33m${args.scopes.join(", ")}\x1b[0m, reset: \x1b[33m${String(args.reset)}\x1b[0m)...`,
    );

    const summary = await seedDatabase({
      db,
      scope: args.scopes,
      reset: args.reset,
    });

    console.log(
      `\n\x1b[1m\x1b[32m[SUCCESS]\x1b[0m Database seeding completed in \x1b[1m${String(summary.durationMs)}ms\x1b[0m:\n`,
    );
    console.table({
      "Dealer Tiers (Tier 1)": { Count: summary.dealerTiers },
      "System & B2B Users (Tier 1)": { Count: summary.users },
      "Brands (Tier 2)": { Count: summary.brands },
      "Categories (Tier 2)": { Count: summary.categories },
      "Products (Tier 2)": { Count: summary.products },
      "Warehouses (Tier 2)": { Count: summary.warehouses },
      "Warehouse Stocks (Tier 2)": { Count: summary.warehouseStocks },
      "Quotes (Tier 3)": { Count: summary.quotes },
      "Quote Items (Tier 3)": { Count: summary.quoteItems },
      "Orders (Tier 3)": { Count: summary.orders },
      "Order Items (Tier 3)": { Count: summary.orderItems },
    });
  } catch (error) {
    console.error(
      `\n\x1b[1m\x1b[31m[FAILURE]\x1b[0m Database seeding failed: ${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (import.meta.main) {
  void main();
}
