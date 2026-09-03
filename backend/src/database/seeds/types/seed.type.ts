import type { DrizzleDB } from "@/database/database.module";
import type {
  Cinema,
  Genre,
  Hall,
  Movie,
  SeatType,
  Show,
  User,
} from "@/database/schemas";
import type { SeedScope } from "../constants/seed.constant";

/**
 * Configuration options passed to the database seeding engine.
 */
export interface SeedOptions {
  /** Drizzle database client instance */
  db: DrizzleDB;
  /** Active scope filter or array of scopes to execute */
  scope?: SeedScope | SeedScope[] | (string & {});
  /** Whether to truncate existing table rows before seeding */
  reset?: boolean;
  /** Whether to enable verbose execution logging */
  verbose?: boolean;
}

/**
 * Execution metrics and record counts produced by the seeding engine.
 */
export interface SeedSummary {
  genres: number;
  seatTypes: number;
  users: number;
  cinemas: number;
  halls: number;
  seats: number;
  movies: number;
  movieTranslations: number;
  shows: number;
  showSeats: number;
  durationMs: number;
  errors: string[];
}

export type SeededGenreRef = Pick<Genre, "id" | "name">;

export type SeededSeatTypeRef = Pick<
  SeatType,
  "id" | "name" | "priceMultiplier"
>;

export type SeededUserRef = Pick<User, "id" | "email" | "role" | "fullName">;

/**
 * Result payload produced by Tier 1 Master Reference seeder.
 */
export interface Tier1SeedResult {
  genres: SeededGenreRef[];
  seatTypes: SeededSeatTypeRef[];
  users: SeededUserRef[];
}

export type SeededCinemaRef = Pick<Cinema, "id" | "name" | "city">;

export type SeededHallRef = Pick<
  Hall,
  "id" | "cinemaId" | "name" | "totalSeats"
>;

export type SeededMovieRef = Pick<Movie, "id" | "durationMinutes"> & {
  title: string;
};

/**
 * Result payload produced by Tier 2 Catalog seeder.
 */
export interface Tier2SeedResult {
  cinemas: SeededCinemaRef[];
  halls: SeededHallRef[];
  seatsCount: number;
  movies: SeededMovieRef[];
  movieTranslationsCount: number;
}

export type SeededShowRef = Pick<
  Show,
  "id" | "movieId" | "hallId" | "startTime" | "endTime" | "basePrice"
>;

/**
 * Result payload produced by Tier 3 Schedule seeder.
 */
export interface Tier3SeedResult {
  shows: SeededShowRef[];
  showSeatsCount: number;
}
