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
import { seedTier3Schedule } from "./tiers/tier3-schedule.seeder";

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
    genres: 0,
    seatTypes: 0,
    users: 0,
    cinemas: 0,
    halls: 0,
    seats: 0,
    movies: 0,
    movieTranslations: 0,
    shows: 0,
    showSeats: 0,
    durationMs: 0,
    errors: [],
  };

  try {
    if (options.reset) {
      await truncateAllTables(options.db);
    }

    let tier1Result: Tier1SeedResult | undefined;

    if (
      isScopeActive(
        normalizedScopes,
        "reference",
        "genres",
        "seat-types",
        "users",
      )
    ) {
      tier1Result = await seedTier1Reference(options.db, normalizedScopes);
      summary.genres = tier1Result.genres.length;
      summary.seatTypes = tier1Result.seatTypes.length;
      summary.users = tier1Result.users.length;
    }

    let tier2Result: Tier2SeedResult | undefined;

    if (isScopeActive(normalizedScopes, "catalog", "cinemas", "movies")) {
      tier2Result = await seedTier2Catalog(
        options.db,
        normalizedScopes,
        tier1Result,
      );
      summary.cinemas = tier2Result.cinemas.length;
      summary.halls = tier2Result.halls.length;
      summary.seats = tier2Result.seatsCount;
      summary.movies = tier2Result.movies.length;
      summary.movieTranslations = tier2Result.movieTranslationsCount;
    }

    let tier3Result: Tier3SeedResult | undefined;

    if (isScopeActive(normalizedScopes, "schedule", "shows")) {
      tier3Result = await seedTier3Schedule(
        options.db,
        normalizedScopes,
        tier2Result,
      );
      summary.shows = tier3Result.shows.length;
      summary.showSeats = tier3Result.showSeatsCount;
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
