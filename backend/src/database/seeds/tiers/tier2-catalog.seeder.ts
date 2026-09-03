import { and, eq } from "drizzle-orm";
import type { DrizzleDB } from "@/database/database.module";
import {
  cinemas,
  halls,
  movieGenres,
  movies,
  movieTranslations,
  seats,
} from "@/database/schemas";
import { SHOWS_CONSTANTS } from "@/modules/shows/shows.constants";
import { SEED_CINEMAS_DATA } from "../data/cinemas.data";
import { SEED_MOVIES_DATA } from "../data/movies.data";
import { isScopeActive, type SeedScope } from "../constants/seed.constant";
import type {
  SeededCinemaRef,
  SeededGenreRef,
  SeededHallRef,
  SeededMovieRef,
  SeededSeatTypeRef,
  Tier1SeedResult,
  Tier2SeedResult,
} from "../types/seed.type";
import { seedGenres, seedSeatTypes } from "./tier1-reference.seeder";

/**
 * Generates an 8x10 procedural seat layout matrix (80 seats per hall)
 * mapped to standard seat type pricing tiers (Rows A-D Standard, E-G VIP, H Couple).
 *
 * @param hallId - Target physical hall UUID
 * @param seatTypeMap - Mapping of normalized seat type name to UUID
 * @returns Array of 80 insertable seat records
 */
export function generateProceduralSeatGrid(
  hallId: string,
  seatTypeMap: Map<string, string>,
) {
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const cols = Array.from({ length: 10 }, (_, i) => i + 1);

  const fallbackTypeId = Array.from(seatTypeMap.values())[0] ?? "";
  const standardTypeId = seatTypeMap.get("standard") ?? fallbackTypeId;
  const vipTypeId = seatTypeMap.get("vip") ?? standardTypeId;
  const coupleTypeId = seatTypeMap.get("couple") ?? vipTypeId;

  const generatedSeats = [];

  for (const row of rows) {
    let seatTypeId = standardTypeId;
    if (["E", "F", "G"].includes(row)) {
      seatTypeId = vipTypeId;
    } else if (row === "H") {
      seatTypeId = coupleTypeId;
    }

    for (const col of cols) {
      generatedSeats.push({
        hallId,
        seatTypeId,
        row,
        number: col,
        seatNumber: `${row}${col.toString()}`,
      });
    }
  }

  return generatedSeats;
}

/**
 * Seeds cinema venues and their physical halls idempotently with selective projections.
 *
 * @param db - Drizzle database client instance
 * @returns Lists of seeded cinema and hall reference entities
 */
export async function seedCinemasAndHalls(
  db: DrizzleDB,
): Promise<{ cinemas: SeededCinemaRef[]; halls: SeededHallRef[] }> {
  const seededCinemas: SeededCinemaRef[] = [];
  const seededHalls: SeededHallRef[] = [];

  for (const cinemaData of SEED_CINEMAS_DATA) {
    let cinemaId = "";
    const existingCinema = (
      await db
        .select({
          id: cinemas.id,
          name: cinemas.name,
          city: cinemas.city,
        })
        .from(cinemas)
        .where(
          and(
            eq(cinemas.name, cinemaData.name),
            eq(cinemas.city, cinemaData.city),
          ),
        )
        .limit(1)
    )[0];

    if (existingCinema) {
      cinemaId = existingCinema.id;
      seededCinemas.push(existingCinema);
    } else {
      const [newCinema] = await db
        .insert(cinemas)
        .values({
          name: cinemaData.name,
          city: cinemaData.city,
          ward: cinemaData.ward,
          streetAddress: cinemaData.streetAddress,
          postalCode: cinemaData.postalCode,
          latitude: cinemaData.latitude,
          longitude: cinemaData.longitude,
        })
        .returning({
          id: cinemas.id,
          name: cinemas.name,
          city: cinemas.city,
        });

      if (newCinema) {
        cinemaId = newCinema.id;
        seededCinemas.push(newCinema);
      }
    }

    for (const hallData of cinemaData.halls) {
      const existingHall = (
        await db
          .select({
            id: halls.id,
            cinemaId: halls.cinemaId,
            name: halls.name,
            totalSeats: halls.totalSeats,
          })
          .from(halls)
          .where(
            and(eq(halls.cinemaId, cinemaId), eq(halls.name, hallData.name)),
          )
          .limit(1)
      )[0];

      if (existingHall) {
        seededHalls.push(existingHall);
      } else {
        const [newHall] = await db
          .insert(halls)
          .values({
            cinemaId,
            name: hallData.name,
            totalSeats: hallData.totalSeats,
          })
          .returning({
            id: halls.id,
            cinemaId: halls.cinemaId,
            name: halls.name,
            totalSeats: halls.totalSeats,
          });

        if (newHall) {
          seededHalls.push(newHall);
        }
      }
    }
  }

  return { cinemas: seededCinemas, halls: seededHalls };
}

/**
 * Seeds the procedural 8x10 physical seats grid for all specified halls in chunked batches.
 *
 * @param db - Drizzle database client instance
 * @param hallList - Target halls to populate with seats
 * @param seatTypeList - Master seat types
 * @returns Total count of seats in the database for seeded halls
 */
export async function seedHallSeats(
  db: DrizzleDB,
  hallList: SeededHallRef[],
  seatTypeList: SeededSeatTypeRef[],
): Promise<number> {
  if (hallList.length === 0) return 0;

  const seatTypeMap = new Map<string, string>();
  for (const st of seatTypeList) {
    seatTypeMap.set(st.name.toLowerCase(), st.id);
  }

  const allSeats = hallList.flatMap((hall) =>
    generateProceduralSeatGrid(hall.id, seatTypeMap),
  );

  const chunkSize = SHOWS_CONSTANTS.SEAT_PREALLOCATION_CHUNK_SIZE;
  for (let i = 0; i < allSeats.length; i += chunkSize) {
    const chunk = allSeats.slice(i, i + chunkSize);
    await db
      .insert(seats)
      .values(chunk)
      .onConflictDoNothing({
        target: [seats.hallId, seats.seatNumber],
      });
  }

  return allSeats.length;
}

/**
 * Seeds bilingual movies, localized translations, and genre join records.
 *
 * @param db - Drizzle database client instance
 * @param genreList - Master genre references
 * @returns List of seeded movie reference entities and translation count
 */
export async function seedMovies(
  db: DrizzleDB,
  genreList: SeededGenreRef[],
): Promise<{ movies: SeededMovieRef[]; translationsCount: number }> {
  const genreMap = new Map<string, string>();
  for (const g of genreList) {
    genreMap.set(g.name.toLowerCase(), g.id);
  }

  const seededMovies: SeededMovieRef[] = [];
  let totalTranslations = 0;

  for (const movieData of SEED_MOVIES_DATA) {
    let movieId = "";
    const existingMovie = (
      await db
        .select({
          id: movies.id,
          durationMinutes: movies.durationMinutes,
        })
        .from(movies)
        .where(eq(movies.tmdbId, movieData.tmdbId))
        .limit(1)
    )[0];

    if (existingMovie) {
      movieId = existingMovie.id;
    } else {
      const [newMovie] = await db
        .insert(movies)
        .values({
          tmdbId: movieData.tmdbId,
          imdbId: movieData.imdbId,
          durationMinutes: movieData.durationMinutes,
          releaseDate: movieData.releaseDate,
          posterUrl: movieData.posterUrl,
          trailerUrl: movieData.trailerUrl,
          rating: movieData.rating,
        })
        .returning({
          id: movies.id,
          durationMinutes: movies.durationMinutes,
        });

      if (newMovie) {
        movieId = newMovie.id;
      }
    }

    for (const translation of movieData.translations) {
      await db
        .insert(movieTranslations)
        .values({
          movieId,
          languageCode: translation.languageCode,
          title: translation.title,
          description: translation.description,
        })
        .onConflictDoUpdate({
          target: [movieTranslations.movieId, movieTranslations.languageCode],
          set: {
            title: translation.title,
            description: translation.description,
          },
        });
      totalTranslations++;
    }

    for (const genreName of movieData.genres) {
      const genreId = genreMap.get(genreName.toLowerCase());
      if (genreId) {
        await db
          .insert(movieGenres)
          .values({
            movieId,
            genreId,
          })
          .onConflictDoNothing({
            target: [movieGenres.movieId, movieGenres.genreId],
          });
      }
    }

    const defaultTitle =
      movieData.translations.find((t) => t.languageCode === "vi")?.title ??
      movieData.translations[0]?.title ??
      "";

    seededMovies.push({
      id: movieId,
      durationMinutes: movieData.durationMinutes,
      title: defaultTitle,
    });
  }

  return { movies: seededMovies, translationsCount: totalTranslations };
}

/**
 * Coordinates and executes Tier 2 Catalog Seeding (Cinemas, Halls, Seats, Movies).
 *
 * @param db - Drizzle database client instance
 * @param scopes - Active normalized seeding scopes
 * @param tier1Result - Optional pre-seeded Tier 1 reference result
 * @returns Aggregate result containing seeded catalog entities
 */
export async function seedTier2Catalog(
  db: DrizzleDB,
  scopes: SeedScope[] = ["all"],
  tier1Result?: Tier1SeedResult,
): Promise<Tier2SeedResult> {
  const result: Tier2SeedResult = {
    cinemas: [],
    halls: [],
    seatsCount: 0,
    movies: [],
    movieTranslationsCount: 0,
  };

  const shouldSeedCinemas = isScopeActive(scopes, "catalog", "cinemas");
  const shouldSeedMovies = isScopeActive(scopes, "catalog", "movies");

  if (shouldSeedCinemas) {
    const { cinemas: seededCinemas, halls: seededHalls } =
      await seedCinemasAndHalls(db);
    result.cinemas = seededCinemas;
    result.halls = seededHalls;

    const seatTypes =
      tier1Result?.seatTypes && tier1Result.seatTypes.length > 0
        ? tier1Result.seatTypes
        : await seedSeatTypes(db);
    result.seatsCount = await seedHallSeats(db, seededHalls, seatTypes);
  }

  if (shouldSeedMovies) {
    const genres =
      tier1Result?.genres && tier1Result.genres.length > 0
        ? tier1Result.genres
        : await seedGenres(db);
    const { movies: seededMovies, translationsCount } = await seedMovies(
      db,
      genres,
    );
    result.movies = seededMovies;
    result.movieTranslationsCount = translationsCount;
  }

  return result;
}
