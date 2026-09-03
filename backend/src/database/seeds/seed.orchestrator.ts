import { truncateAllTables } from "@/database/database.connection";
import { isScopeActive, normalizeSeedScopes } from "./constants/seed.constant";
import type {
  SeedOptions,
  SeedSummary,
  Tier1SeedResult,
  Tier2SeedResult,
  Tier3SeedResult,
} from "./types/seed.type";
import { seedTier1Reference } from "./tiers/tier1-reference.seeder";
import { seedTier2Catalog } from "./tiers/tier2-catalog.seeder";
import { seedTier3Operational } from "./tiers/tier3-operational.seeder";

/**
 * Coordinates and executes database seeding across requested scopes and tiers.
 *
 * @param options - Seeding configuration options
 * @returns Comprehensive summary of seeded entity counts and timing
 */
export async function seedDatabase(options: SeedOptions): Promise<SeedSummary> {
  const startTime = Date.now();
  const normalizedScopes = normalizeSeedScopes(options.scope);

  const summary: SeedSummary = {
    dealerTiers: 0,
    users: 0,
    brands: 0,
    categories: 0,
    products: 0,
    warehouses: 0,
    warehouseStocks: 0,
    quotes: 0,
    quoteItems: 0,
    orders: 0,
    orderItems: 0,
    durationMs: 0,
    errors: [],
  };

  try {
    if (options.reset) {
      await truncateAllTables(options.db);
    }

    let tier1Result: Tier1SeedResult | undefined;

    if (isScopeActive(normalizedScopes, "reference", "dealer-tiers", "users")) {
      tier1Result = await seedTier1Reference(options.db, normalizedScopes);
      summary.dealerTiers = tier1Result.dealerTiers.length;
      summary.users = tier1Result.users.length;
    }

    let tier2Result: Tier2SeedResult | undefined;

    if (
      isScopeActive(
        normalizedScopes,
        "catalog",
        "brands",
        "categories",
        "products",
        "warehouses",
      )
    ) {
      tier2Result = await seedTier2Catalog(
        options.db,
        normalizedScopes,
        tier1Result,
      );
      summary.brands = tier2Result.brands.length;
      summary.categories = tier2Result.categories.length;
      summary.products = tier2Result.products.length;
      summary.warehouses = tier2Result.warehouses.length;
      summary.warehouseStocks = tier2Result.warehouseStocksCount;
    }

    let tier3Result: Tier3SeedResult | undefined;

    if (isScopeActive(normalizedScopes, "operational", "quotes", "orders")) {
      tier3Result = await seedTier3Operational(
        options.db,
        normalizedScopes,
        tier2Result,
      );
      summary.quotes = tier3Result.quotes.length;
      summary.quoteItems = tier3Result.quoteItemsCount;
      summary.orders = tier3Result.orders.length;
      summary.orderItems = tier3Result.orderItemsCount;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    summary.errors.push(errorMessage);
    throw error;
  } finally {
    summary.durationMs = Date.now() - startTime;
  }

  return summary;
}
