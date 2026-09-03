import {
  date,
  index,
  integer,
  primaryKey,
  snakeCase,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { movieRatingEnum } from "./enums.schema";
import { baseEntity, baseTimestamps, primaryKeyUuid } from "./helpers.schema";

export const movies = snakeCase.table("movies", {
  ...baseEntity,
  tmdbId: varchar({ length: 50 }).unique(),
  imdbId: varchar({ length: 50 }).unique(),
  durationMinutes: integer().notNull(),
  releaseDate: date({ mode: "string" }),
  posterUrl: text(),
  trailerUrl: text(),
  rating: movieRatingEnum(),
});

export const genres = snakeCase.table("genres", {
  ...primaryKeyUuid,
  name: varchar({ length: 100 }).notNull().unique(),
});

export const movieGenres = snakeCase.table(
  "movie_genres",
  {
    movieId: uuid()
      .notNull()
      .references(() => movies.id, { onDelete: "cascade" }),
    genreId: uuid()
      .notNull()
      .references(() => genres.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.movieId, table.genreId] }),
    index("movie_genres_genre_id_idx").on(table.genreId),
  ],
);

export const movieTranslations = snakeCase.table(
  "movie_translations",
  {
    movieId: uuid()
      .notNull()
      .references(() => movies.id, { onDelete: "cascade" }),
    languageCode: varchar({ length: 10 }).notNull(),
    title: varchar({ length: 255 }).notNull(),
    description: text(),
    ...baseTimestamps,
  },
  (table) => [
    primaryKey({ columns: [table.movieId, table.languageCode] }),
    index("movie_translations_title_idx").on(table.title),
  ],
);

export type Movie = typeof movies.$inferSelect;
export type NewMovie = typeof movies.$inferInsert;
export type Genre = typeof genres.$inferSelect;
export type NewGenre = typeof genres.$inferInsert;
export type MovieTranslation = typeof movieTranslations.$inferSelect;
export type NewMovieTranslation = typeof movieTranslations.$inferInsert;
