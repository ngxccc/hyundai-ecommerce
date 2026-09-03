import { and, gte, inArray, lt } from "drizzle-orm";
import type { DrizzleDB } from "@/database/database.module";
import { seats, shows, showSeats, type NewShow } from "@/database/schemas";
import { TIME_IN_MS } from "@/common/constants/time.constant";
import { getTimezoneDateParts } from "@/common/utils/date.util";
import { SHOWS_CONSTANTS } from "@/modules/shows/shows.constants";
import {
  STANDARD_SHOW_SLOTS,
  isScopeActive,
  type SeedScope,
} from "../constants/seed.constant";
import type {
  SeededHallRef,
  SeededMovieRef,
  SeededShowRef,
  Tier2SeedResult,
  Tier3SeedResult,
} from "../types/seed.type";
import {
  seedCinemasAndHalls,
  seedHallSeats,
  seedMovies,
} from "./tier2-catalog.seeder";
import { seedGenres, seedSeatTypes } from "./tier1-reference.seeder";

export type CandidateShowSlot = Omit<NewShow, "id" | "createdAt" | "updatedAt">;

/**
 * Computes dynamic showtimes for T+0 to T+6 days in Asia/Ho_Chi_Minh timezone (UTC+7)
 * strictly enforcing Invariant INV-1 (startTime >= NOW() + 15 minutes).
 *
 * @param halls - Available physical halls
 * @param movies - Available movies
 * @param now - Execution baseline timestamp
 * @returns Array of candidate future show slot objects
 */
export function generateDynamicShowtimes(
  halls: SeededHallRef[],
  movies: SeededMovieRef[],
  now: Date = new Date(),
): CandidateShowSlot[] {
  if (halls.length === 0 || movies.length === 0) return [];

  const candidates: CandidateShowSlot[] = [];
  const bufferMs = SHOWS_CONSTANTS.CLEANING_BUFFER_MINUTES * TIME_IN_MS.MINUTE;
  const earliestAllowedStart = now.getTime() + bufferMs;

  const {
    year,
    month: monthOneIndexed,
    day,
  } = getTimezoneDateParts(now, SHOWS_CONSTANTS.DEFAULT_TIMEZONE);
  const monthZeroIndexed = monthOneIndexed - 1;

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const targetDate = new Date(
      Date.UTC(year, monthZeroIndexed, day + dayOffset),
    );
    const yStr = targetDate.getUTCFullYear().toString();
    const mStr = (targetDate.getUTCMonth() + 1).toString().padStart(2, "0");
    const dStr = targetDate.getUTCDate().toString().padStart(2, "0");

    for (const [hIdx, hall] of halls.entries()) {
      for (const [sIdx, slotTime] of STANDARD_SHOW_SLOTS.entries()) {
        const movieIndex = (dayOffset + hIdx + sIdx) % movies.length;
        const movie = movies[movieIndex] ?? movies[0];
        if (!movie) continue;

        const isoString = `${yStr}-${mStr}-${dStr}T${slotTime}:00${SHOWS_CONSTANTS.TIMEZONE_OFFSET}`;
        const startTime = new Date(isoString);

        if (startTime.getTime() < earliestAllowedStart) {
          continue;
        }

        const durationMs = movie.durationMinutes * TIME_IN_MS.MINUTE;
        const endTime = new Date(startTime.getTime() + durationMs);

        let basePrice = 85000;
        if (hall.name.toLowerCase().includes("imax")) {
          basePrice = 120000;
        } else if (
          hall.name.toLowerCase().includes("gold") ||
          hall.name.toLowerCase().includes("vip")
        ) {
          basePrice = 110000;
        }

        candidates.push({
          movieId: movie.id,
          hallId: hall.id,
          startTime,
          endTime,
          basePrice,
        });
      }
    }
  }

  return candidates;
}

/**
 * Checks whether a candidate show time range overlaps with an existing showtime in the same hall
 * considering PostgreSQL GiST schedule exclusion buffer (15 minutes).
 */
export function hasScheduleCollision(
  candidate: CandidateShowSlot,
  existing: { startTime: Date; endTime: Date },
): boolean {
  const bufferMs = SHOWS_CONSTANTS.CLEANING_BUFFER_MINUTES * TIME_IN_MS.MINUTE;
  const candidateEndWithBuffer = candidate.endTime.getTime() + bufferMs;
  const existingEndWithBuffer = existing.endTime.getTime() + bufferMs;

  return (
    candidate.startTime.getTime() < existingEndWithBuffer &&
    candidateEndWithBuffer > existing.startTime.getTime()
  );
}

/**
 * Seeds relative showtimes and chunked preallocated show seats idempotently.
 *
 * @param db - Drizzle database client instance
 * @param halls - Target physical halls
 * @param movies - Target movies
 * @returns Result object containing seeded shows and show seat count
 */
export async function seedShowsAndShowSeats(
  db: DrizzleDB,
  halls: SeededHallRef[],
  movies: SeededMovieRef[],
): Promise<Tier3SeedResult> {
  const now = new Date();

  await db.delete(shows).where(lt(shows.endTime, now));

  const hallIds = halls.map((h) => h.id);
  if (hallIds.length === 0 || movies.length === 0) {
    return { shows: [], showSeatsCount: 0 };
  }

  const existingShows = await db
    .select({
      id: shows.id,
      movieId: shows.movieId,
      hallId: shows.hallId,
      startTime: shows.startTime,
      endTime: shows.endTime,
      basePrice: shows.basePrice,
    })
    .from(shows)
    .where(and(inArray(shows.hallId, hallIds), gte(shows.startTime, now)));

  const candidateSlots = generateDynamicShowtimes(halls, movies, now);

  const showsToInsert: CandidateShowSlot[] = [];

  for (const candidate of candidateSlots) {
    const existingInHall = existingShows.filter(
      (s) => s.hallId === candidate.hallId,
    );
    const hasCollision = existingInHall.some((existing) =>
      hasScheduleCollision(candidate, existing),
    );

    const isAlreadyPlanned = showsToInsert.some(
      (planned) =>
        planned.hallId === candidate.hallId &&
        hasScheduleCollision(candidate, planned),
    );

    if (!hasCollision && !isAlreadyPlanned) {
      showsToInsert.push(candidate);
    }
  }

  const newlyInsertedShows: SeededShowRef[] = [];

  if (showsToInsert.length > 0) {
    const inserted = await db.insert(shows).values(showsToInsert).returning({
      id: shows.id,
      movieId: shows.movieId,
      hallId: shows.hallId,
      startTime: shows.startTime,
      endTime: shows.endTime,
      basePrice: shows.basePrice,
    });

    newlyInsertedShows.push(...inserted);
  }

  const allActiveShows = [...existingShows, ...newlyInsertedShows];

  let totalCreatedShowSeats = 0;

  if (newlyInsertedShows.length > 0) {
    const newlyInsertedHallIds = Array.from(
      new Set(newlyInsertedShows.map((s) => s.hallId)),
    );

    const physicalSeats = await db
      .select({
        id: seats.id,
        hallId: seats.hallId,
      })
      .from(seats)
      .where(inArray(seats.hallId, newlyInsertedHallIds));

    const seatsByHall = new Map<string, string[]>();
    for (const seat of physicalSeats) {
      const list = seatsByHall.get(seat.hallId) ?? [];
      list.push(seat.id);
      seatsByHall.set(seat.hallId, list);
    }

    const showSeatsToInsert = [];
    for (const show of newlyInsertedShows) {
      const hallSeatIds = seatsByHall.get(show.hallId) ?? [];
      for (const seatId of hallSeatIds) {
        showSeatsToInsert.push({
          showId: show.id,
          seatId,
          status: "available" as const,
        });
      }
    }

    const chunkSize = SHOWS_CONSTANTS.SEAT_PREALLOCATION_CHUNK_SIZE;
    for (let i = 0; i < showSeatsToInsert.length; i += chunkSize) {
      const chunk = showSeatsToInsert.slice(i, i + chunkSize);
      await db
        .insert(showSeats)
        .values(chunk)
        .onConflictDoNothing({
          target: [showSeats.showId, showSeats.seatId],
        });
    }

    totalCreatedShowSeats = showSeatsToInsert.length;
  }

  return {
    shows: allActiveShows,
    showSeatsCount: totalCreatedShowSeats,
  };
}

/**
 * Coordinates and executes Tier 3 Schedule Seeding (Dynamic Shows & Preallocated Show Seats).
 *
 * @param db - Drizzle database client instance
 * @param scopes - Active normalized seeding scopes
 * @param tier2Result - Optional pre-seeded Tier 2 catalog result
 * @returns Aggregate result containing seeded show entities and show seat counts
 */
export async function seedTier3Schedule(
  db: DrizzleDB,
  scopes: SeedScope[] = ["all"],
  tier2Result?: Tier2SeedResult,
): Promise<Tier3SeedResult> {
  const shouldSeedShows = isScopeActive(scopes, "schedule", "shows");
  if (!shouldSeedShows) {
    return { shows: [], showSeatsCount: 0 };
  }

  let halls = tier2Result?.halls;
  let movies = tier2Result?.movies;

  if (!halls || halls.length === 0) {
    const seatTypes = await seedSeatTypes(db);
    const catalogVenues = await seedCinemasAndHalls(db);
    halls = catalogVenues.halls;
    await seedHallSeats(db, halls, seatTypes);
  }

  if (!movies || movies.length === 0) {
    const genres = await seedGenres(db);
    const catalogMovies = await seedMovies(db, genres);
    movies = catalogMovies.movies;
  }

  return seedShowsAndShowSeats(db, halls, movies);
}
