import { and, eq, exists, gt, gte, ilike, sql, type SQL } from "drizzle-orm";
import type { DrizzleDB } from "@/database/database.module";
import {
  movieGenres,
  movies,
  movieTranslations,
  shows,
} from "@/database/schemas";
import { type movieRatingEnum } from "@/database/schemas/enums.schema";
import { type MovieStatus } from "../dto";

export type MovieRating = (typeof movieRatingEnum.enumValues)[number];

/**
 * Escapes PostgreSQL ILIKE wildcard characters (%, _, \\) to prevent ReDoS and full table scans.
 *
 * @param val Raw input search string
 * @returns Sanitized string with escaped wildcard characters
 */
export function escapeLikePattern(val: string): string {
  return val.replace(/[%_\\]/g, "\\$&");
}

/**
 * Composable, type-safe Drizzle filter specification helpers for movie catalog queries.
 */
export const movieFilters = {
  /**
   * Filters movies by schedule status (now-showing requires future showtime, coming-soon requires future release).
   */
  byStatus: (db: DrizzleDB, status?: MovieStatus): SQL | undefined => {
    if (status === "now-showing") {
      return exists(
        db
          .select({ one: sql`1` })
          .from(shows)
          .where(
            and(eq(shows.movieId, movies.id), gte(shows.startTime, sql`NOW()`)),
          ),
      );
    }
    if (status === "coming-soon") {
      return gt(movies.releaseDate, sql`CURRENT_DATE`);
    }
    return undefined;
  },

  /**
   * Filters movies by genre UUIDv7 foreign key on movie_genres relation table.
   */
  byGenreId: (db: DrizzleDB, genreId?: string): SQL | undefined =>
    genreId
      ? exists(
          db
            .select({ one: sql`1` })
            .from(movieGenres)
            .where(
              and(
                eq(movieGenres.movieId, movies.id),
                eq(movieGenres.genreId, genreId),
              ),
            ),
        )
      : undefined,

  /**
   * Filters movies by exact age rating code.
   */
  byRating: (rating?: MovieRating): SQL | undefined =>
    rating ? eq(movies.rating, rating) : undefined,

  /**
   * Performs cross-language title search across all movie translations with wildcard escaping.
   */
  bySearch: (db: DrizzleDB, search?: string): SQL | undefined =>
    search
      ? exists(
          db
            .select({ one: sql`1` })
            .from(movieTranslations)
            .where(
              and(
                eq(movieTranslations.movieId, movies.id),
                ilike(
                  movieTranslations.title,
                  `%${escapeLikePattern(search)}%`,
                ),
              ),
            ),
        )
      : undefined,
};
