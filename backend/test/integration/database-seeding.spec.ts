import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "bun:test";
import {
  createWorkerTestDatabase,
  teardownWorkerTestDatabase,
  type TestDatabaseContext,
} from "../helpers/database.helper";
import { truncateAllTables } from "@/database/database.connection";
import {
  cinemas,
  genres,
  halls,
  movies,
  movieGenres,
  movieTranslations,
  seats,
  seatTypes,
  shows,
  showSeats,
  users,
} from "@/database/schemas";
import { seedDatabase } from "@/database/seeds/seed.orchestrator";
import { MASTER_GENRES } from "@/database/seeds/data/genres.data";
import { SEAT_TYPES_DATA } from "@/database/seeds/data/seat-types.data";
import { SEED_USERS_DATA } from "@/database/seeds/data/users.data";
import { SEED_CINEMAS_DATA } from "@/database/seeds/data/cinemas.data";
import { SEED_MOVIES_DATA } from "@/database/seeds/data/movies.data";
import { comparePassword } from "@/common/utils/crypto.util";
import { DEFAULT_SEED_PASSWORD } from "@/database/seeds/constants/seed.constant";
import { SHOWS_CONSTANTS } from "@/modules/shows/shows.constants";
import { TIME_IN_MS } from "@/common/constants/time.constant";
import {
  seedShowsAndShowSeats,
  seedTier3Schedule,
} from "@/database/seeds/tiers/tier3-schedule.seeder";

describe("Database Seeding Engine Integration", () => {
  let context: TestDatabaseContext;

  beforeAll(async () => {
    context = await createWorkerTestDatabase();
  });

  afterAll(async () => {
    await teardownWorkerTestDatabase(context);
  });

  beforeEach(async () => {
    await truncateAllTables(context.db, context.schemaName);
  });

  describe("Tier 1: Master Reference Data Seeding", () => {
    it("should successfully seed genres, seat types, and verified system users", async () => {
      const summary = await seedDatabase({
        db: context.db,
        scope: "reference",
      });

      expect(summary.errors).toHaveLength(0);
      expect(summary.genres).toBe(MASTER_GENRES.length);
      expect(summary.seatTypes).toBe(SEAT_TYPES_DATA.length);
      expect(summary.users).toBe(SEED_USERS_DATA.length);

      const dbGenres = await context.db
        .select({ id: genres.id, name: genres.name })
        .from(genres);
      expect(dbGenres).toHaveLength(MASTER_GENRES.length);

      const dbSeatTypes = await context.db
        .select({
          id: seatTypes.id,
          name: seatTypes.name,
          priceMultiplier: seatTypes.priceMultiplier,
        })
        .from(seatTypes);
      expect(dbSeatTypes).toHaveLength(SEAT_TYPES_DATA.length);

      const dbUsers = await context.db
        .select({
          id: users.id,
          email: users.email,
          role: users.role,
          status: users.status,
          passwordHash: users.passwordHash,
        })
        .from(users);
      expect(dbUsers).toHaveLength(SEED_USERS_DATA.length);

      const adminUser = dbUsers.find((u) => u.role === "admin");
      expect(adminUser).toBeDefined();
      expect(adminUser?.status).toBe("active");
      const isPasswordValid = await comparePassword(
        DEFAULT_SEED_PASSWORD,
        adminUser?.passwordHash ?? "",
      );
      expect(isPasswordValid).toBeTrue();
    });

    it("should be idempotent and produce zero duplicate rows when run consecutively", async () => {
      const summary1 = await seedDatabase({
        db: context.db,
        scope: "reference",
      });
      expect(summary1.genres).toBe(MASTER_GENRES.length);
      expect(summary1.seatTypes).toBe(SEAT_TYPES_DATA.length);
      expect(summary1.users).toBe(SEED_USERS_DATA.length);

      const summary2 = await seedDatabase({
        db: context.db,
        scope: "reference",
      });
      expect(summary2.errors).toHaveLength(0);

      const dbGenres = await context.db.select({ id: genres.id }).from(genres);
      const dbSeatTypes = await context.db
        .select({ id: seatTypes.id })
        .from(seatTypes);
      const dbUsers = await context.db.select({ id: users.id }).from(users);

      expect(dbGenres.length).toBe(MASTER_GENRES.length);
      expect(dbSeatTypes.length).toBe(SEAT_TYPES_DATA.length);
      expect(dbUsers.length).toBe(SEED_USERS_DATA.length);
    });

    it("should support selective granular scoping for genres, seat-types, and users", async () => {
      await seedDatabase({
        db: context.db,
        scope: "genres",
      });

      const dbGenres = await context.db.select({ id: genres.id }).from(genres);
      const dbSeatTypes = await context.db
        .select({ id: seatTypes.id })
        .from(seatTypes);
      const dbUsers = await context.db.select({ id: users.id }).from(users);

      expect(dbGenres.length).toBe(MASTER_GENRES.length);
      expect(dbSeatTypes.length).toBe(0);
      expect(dbUsers.length).toBe(0);
    });

    it("should support comma-separated multi-scopes and array scopes", async () => {
      await seedDatabase({
        db: context.db,
        scope: "genres,users",
      });

      const dbGenres = await context.db.select({ id: genres.id }).from(genres);
      const dbSeatTypes = await context.db
        .select({ id: seatTypes.id })
        .from(seatTypes);
      const dbUsers = await context.db.select({ id: users.id }).from(users);

      expect(dbGenres.length).toBe(MASTER_GENRES.length);
      expect(dbSeatTypes.length).toBe(0);
      expect(dbUsers.length).toBe(SEED_USERS_DATA.length);
    });

    it(
      "should seed all supported entities when no scope option is provided",
      async () => {
        const summary = await seedDatabase({
          db: context.db,
        });

        expect(summary.genres).toBe(MASTER_GENRES.length);
        expect(summary.seatTypes).toBe(SEAT_TYPES_DATA.length);
        expect(summary.users).toBe(SEED_USERS_DATA.length);
        expect(summary.cinemas).toBe(SEED_CINEMAS_DATA.length);
        expect(summary.movies).toBe(SEED_MOVIES_DATA.length);
        expect(summary.shows).toBeGreaterThan(0);
        expect(summary.showSeats).toBe(summary.shows * 80);
      },
      { timeout: 30000 },
    );

    it("should reject execution when an invalid scope is provided", async () => {
      let thrownError: Error | null = null;
      try {
        await seedDatabase({
          db: context.db,
          scope: "invalid-scope",
        });
      } catch (error) {
        thrownError = error as Error;
      }

      expect(thrownError).toBeDefined();
      expect(thrownError?.message).toMatch(/invalid seeding scope/i);
    });
  });

  describe("Tier 2: Catalog Data Seeding (Cinemas, Halls, Procedural Seats, Movies)", () => {
    it("should successfully seed cinemas, halls, and 8x10 procedural physical seats", async () => {
      const summary = await seedDatabase({
        db: context.db,
        scope: "cinemas",
      });

      expect(summary.errors).toHaveLength(0);
      expect(summary.cinemas).toBe(SEED_CINEMAS_DATA.length);

      const totalExpectedHalls = SEED_CINEMAS_DATA.reduce(
        (acc, c) => acc + c.halls.length,
        0,
      );
      expect(summary.halls).toBe(totalExpectedHalls);

      const totalExpectedSeats = totalExpectedHalls * 80;
      expect(summary.seats).toBe(totalExpectedSeats);

      const dbCinemas = await context.db
        .select({ id: cinemas.id, name: cinemas.name, city: cinemas.city })
        .from(cinemas);
      expect(dbCinemas).toHaveLength(SEED_CINEMAS_DATA.length);

      const dbHalls = await context.db
        .select({ id: halls.id, cinemaId: halls.cinemaId, name: halls.name })
        .from(halls);
      expect(dbHalls).toHaveLength(totalExpectedHalls);

      const dbSeats = await context.db
        .select({ id: seats.id, row: seats.row, number: seats.number })
        .from(seats);
      expect(dbSeats).toHaveLength(totalExpectedSeats);
    });

    it("should successfully seed bilingual movies, translations, and genre links", async () => {
      const summary = await seedDatabase({
        db: context.db,
        scope: "movies",
      });

      expect(summary.errors).toHaveLength(0);
      expect(summary.movies).toBe(SEED_MOVIES_DATA.length);
      expect(summary.movieTranslations).toBe(SEED_MOVIES_DATA.length * 2);

      const dbMovies = await context.db
        .select({ id: movies.id, tmdbId: movies.tmdbId })
        .from(movies);
      expect(dbMovies).toHaveLength(SEED_MOVIES_DATA.length);

      const dbTranslations = await context.db
        .select({
          movieId: movieTranslations.movieId,
          languageCode: movieTranslations.languageCode,
          title: movieTranslations.title,
        })
        .from(movieTranslations);
      expect(dbTranslations).toHaveLength(SEED_MOVIES_DATA.length * 2);

      const dbMovieGenres = await context.db
        .select({ movieId: movieGenres.movieId, genreId: movieGenres.genreId })
        .from(movieGenres);
      expect(dbMovieGenres.length).toBeGreaterThanOrEqual(
        SEED_MOVIES_DATA.length,
      );
    });

    it(
      "should be idempotent across Tier 2 and produce zero duplicate rows when run consecutively",
      async () => {
        await seedDatabase({
          db: context.db,
          scope: "catalog",
        });

        const summary2 = await seedDatabase({
          db: context.db,
          scope: "catalog",
        });

        expect(summary2.errors).toHaveLength(0);

        const totalExpectedHalls = SEED_CINEMAS_DATA.reduce(
          (acc, c) => acc + c.halls.length,
          0,
        );
        const totalExpectedSeats = totalExpectedHalls * 80;

        const dbCinemas = await context.db
          .select({ id: cinemas.id })
          .from(cinemas);
        const dbHalls = await context.db.select({ id: halls.id }).from(halls);
        const dbSeats = await context.db.select({ id: seats.id }).from(seats);
        const dbMovies = await context.db
          .select({ id: movies.id })
          .from(movies);

        expect(dbCinemas.length).toBe(SEED_CINEMAS_DATA.length);
        expect(dbHalls.length).toBe(totalExpectedHalls);
        expect(dbSeats.length).toBe(totalExpectedSeats);
        expect(dbMovies.length).toBe(SEED_MOVIES_DATA.length);
      },
      { timeout: 20000 },
    );

    it("should seamlessly seed multi-scope targets (e.g. genres,cinemas)", async () => {
      const summary = await seedDatabase({
        db: context.db,
        scope: ["genres", "cinemas"],
      });

      expect(summary.errors).toHaveLength(0);
      expect(summary.genres).toBe(MASTER_GENRES.length);
      expect(summary.seatTypes).toBe(0);
      expect(summary.users).toBe(0);
      expect(summary.cinemas).toBe(SEED_CINEMAS_DATA.length);
      expect(summary.movies).toBe(0);
    });
  });

  describe("Tier 3: Dynamic Schedule & Preallocated Seats Engine", () => {
    it(
      "should dynamically seed relative shows (T+0 to T+6) strictly enforcing Invariant INV-1",
      async () => {
        const summary = await seedDatabase({
          db: context.db,
          scope: "all",
        });

        expect(summary.errors).toHaveLength(0);
        expect(summary.shows).toBeGreaterThan(0);
        expect(summary.showSeats).toBe(summary.shows * 80);

        const now = new Date();
        const bufferMs =
          SHOWS_CONSTANTS.CLEANING_BUFFER_MINUTES * TIME_IN_MS.MINUTE;

        // Verify Invariant INV-1: Every created showtime must be in the future (>= NOW + 15m)
        const dbShows = await context.db
          .select({
            id: shows.id,
            startTime: shows.startTime,
            endTime: shows.endTime,
          })
          .from(shows);

        expect(dbShows.length).toBe(summary.shows);
        for (const show of dbShows) {
          expect(show.startTime.getTime()).toBeGreaterThanOrEqual(
            now.getTime() + bufferMs - 5000, // 5s clock tolerance
          );
          expect(show.endTime.getTime()).toBeGreaterThan(
            show.startTime.getTime(),
          );
        }

        // Verify Show Seats preallocation (80 seats per show, status = 'available')
        const dbShowSeats = await context.db
          .select({
            id: showSeats.id,
            status: showSeats.status,
          })
          .from(showSeats);

        expect(dbShowSeats.length).toBe(summary.shows * 80);
        expect(dbShowSeats.every((s) => s.status === "available")).toBeTrue();
      },
      { timeout: 30000 },
    );

    it(
      "should support standalone scope=shows with automatic fallback catalog resolution",
      async () => {
        const summary = await seedDatabase({
          db: context.db,
          scope: "shows",
        });

        expect(summary.errors).toHaveLength(0);
        expect(summary.shows).toBeGreaterThan(0);
        expect(summary.showSeats).toBe(summary.shows * 80);
      },
      { timeout: 30000 },
    );

    it(
      "should be idempotent and never trigger PostgreSQL GiST exclusion collisions on consecutive runs",
      async () => {
        // First Run
        const summary1 = await seedDatabase({
          db: context.db,
          scope: "all",
        });
        expect(summary1.shows).toBeGreaterThan(0);

        // Second Run (Consecutive Execution)
        const summary2 = await seedDatabase({
          db: context.db,
          scope: "all",
        });
        expect(summary2.errors).toHaveLength(0);
        expect(summary2.shows).toBe(summary1.shows);

        const dbShows = await context.db.select({ id: shows.id }).from(shows);
        expect(dbShows.length).toBe(summary1.shows);
      },
      { timeout: 30000 },
    );

    it("should return empty result when no halls or movies are provided to seedShowsAndShowSeats", async () => {
      const result = await seedShowsAndShowSeats(context.db, [], []);
      expect(result.shows).toHaveLength(0);
      expect(result.showSeatsCount).toBe(0);
    });

    it("should return empty result when schedule scope is not active in seedTier3Schedule", async () => {
      const result = await seedTier3Schedule(context.db, ["genres"]);
      expect(result.shows).toHaveLength(0);
      expect(result.showSeatsCount).toBe(0);
    });
  });

  describe("Production Safety Guard", () => {
    it("should throw error and abort if reset is requested in production environment", async () => {
      const originalEnv = process.env.NODE_ENV;
      let thrownError: Error | null = null;
      try {
        process.env.NODE_ENV = "production";
        await seedDatabase({
          db: context.db,
          scope: "reference",
          reset: true,
        });
      } catch (error) {
        thrownError = error as Error;
      } finally {
        process.env.NODE_ENV = originalEnv;
      }

      expect(thrownError).toBeDefined();
      expect(thrownError?.message).toMatch(/production/i);
    });
  });
});
