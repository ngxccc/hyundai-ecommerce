import type { DrizzleDB } from "@/database/database.module";
import {
  movies,
  genres,
  movieGenres,
  movieTranslations,
  type Movie,
  type NewMovie,
  type Genre,
  type NewGenre,
} from "@/database/schemas";

export async function createMovie(
  db: DrizzleDB,
  overrides: Partial<NewMovie> = {},
): Promise<Movie> {
  const [movie] = await db
    .insert(movies)
    .values({
      durationMinutes: 120,
      rating: "PG",
      releaseDate: "2026-01-01",
      posterUrl: "https://example.com/poster.jpg",
      trailerUrl: "https://example.com/trailer.mp4",
      ...overrides,
    })
    .returning();

  if (!movie) {
    throw new Error("Failed to create Movie entity in test factory");
  }
  return movie;
}

export async function createGenre(
  db: DrizzleDB,
  overrides: Partial<NewGenre> = {},
): Promise<Genre> {
  const [genre] = await db
    .insert(genres)
    .values({
      name: `Genre-${crypto.randomUUID().slice(0, 8)}`,
      ...overrides,
    })
    .returning();

  if (!genre) {
    throw new Error("Failed to create Genre entity in test factory");
  }
  return genre;
}

export async function linkMovieGenre(
  db: DrizzleDB,
  movieId: string,
  genreId: string,
): Promise<void> {
  await db.insert(movieGenres).values({ movieId, genreId });
}

export async function createMovieTranslation(
  db: DrizzleDB,
  movieId: string,
  languageCode = "vi",
  title = "Tên Phim Test",
  description = "Mô tả phim test",
): Promise<void> {
  await db.insert(movieTranslations).values({
    movieId,
    languageCode,
    title,
    description,
  });
}
