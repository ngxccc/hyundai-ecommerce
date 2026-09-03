import type { DrizzleDB } from "@/database/database.module";
import { createMovie } from "../factories/movie.factory";
import type { Movie } from "@/database/schemas";

export const MovieMother = {
  /** Standard theatrical movie release (120 minutes, PG) */
  standard(db: DrizzleDB): Promise<Movie> {
    return createMovie(db, {
      durationMinutes: 120,
      rating: "PG",
      posterUrl: "https://example.com/standard-poster.jpg",
    });
  },

  /** Extended duration blockbuster movie (300 minutes, PG) */
  blockbusterLong(db: DrizzleDB): Promise<Movie> {
    return createMovie(db, {
      durationMinutes: 300,
      rating: "PG",
      posterUrl: "https://example.com/long-poster.jpg",
    });
  },

  /** Short animated film (30 minutes, G) */
  animationShort(db: DrizzleDB): Promise<Movie> {
    return createMovie(db, {
      durationMinutes: 30,
      rating: "G",
      posterUrl: "https://example.com/short-poster.jpg",
    });
  },
} as const;
