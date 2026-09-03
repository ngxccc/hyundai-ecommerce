import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import type { I18nTranslations } from "@/generated/i18n.generated";
import {
  DATABASE_CONNECTION,
  type DrizzleDB,
} from "@/database/database.module";
import {
  type CatalogLanguage,
  type MovieListQueryDto,
  type MovieListResponseDto,
  type MovieResponseDto,
} from "./dto";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import {
  genres,
  movieGenres,
  movies,
  movieTranslations,
} from "@/database/schemas";
import { movieFilters } from "./filters";

/**
 * Service managing public movie catalog discovery, filtering, and localization.
 */
@Injectable()
export class MoviesService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    public readonly db: DrizzleDB,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  /**
   * Discovers public movies with pagination, schedule status, genre, and localized translations.
   *
   * @param query Validated movie query filter parameters
   * @returns Paginated movie list with metadata envelope
   */
  async findMovies(query: MovieListQueryDto): Promise<MovieListResponseDto> {
    const page = query.page;
    const limit = query.limit;
    const offset = (page - 1) * limit;
    const lang = query.lang;

    const whereClause = and(
      movieFilters.byStatus(this.db, query.status),
      movieFilters.byGenreId(this.db, query.genreId),
      movieFilters.byRating(query.rating),
      movieFilters.bySearch(this.db, query.search),
    );

    const [countResult] = await this.db
      .select({ count: sql<number>`cast(count(distinct ${movies.id}) as int)` })
      .from(movies)
      .where(whereClause);

    const total = countResult?.count ?? 0;
    const totalPages = total > 0 ? Math.ceil(total / limit) : 0;

    if (total === 0) {
      return {
        data: [],
        meta: { page, limit, total, totalPages },
      };
    }

    const movieRows = await this.db
      .select({
        id: movies.id,
        durationMinutes: movies.durationMinutes,
        releaseDate: movies.releaseDate,
        rating: movies.rating,
        posterUrl: movies.posterUrl,
        trailerUrl: movies.trailerUrl,
      })
      .from(movies)
      .where(whereClause)
      .orderBy(desc(movies.releaseDate), desc(movies.createdAt), asc(movies.id))
      .limit(limit)
      .offset(offset);

    const movieIds = movieRows.map((m) => m.id);

    const [translations, genreRows] = await Promise.all([
      this.db
        .select({
          movieId: movieTranslations.movieId,
          languageCode: movieTranslations.languageCode,
          title: movieTranslations.title,
          description: movieTranslations.description,
        })
        .from(movieTranslations)
        .where(inArray(movieTranslations.movieId, movieIds)),
      this.db
        .select({
          movieId: movieGenres.movieId,
          id: genres.id,
          name: genres.name,
        })
        .from(movieGenres)
        .innerJoin(genres, eq(genres.id, movieGenres.genreId))
        .where(inArray(movieGenres.movieId, movieIds)),
    ]);

    const data = movieRows.map((movie) => {
      const movieTransList = translations.filter((t) => t.movieId === movie.id);
      const requestedTrans = movieTransList.find(
        (t) => t.languageCode === lang,
      );
      const fallbackTrans =
        movieTransList.find((t) => t.languageCode === "vi") ??
        movieTransList[0];

      const title = requestedTrans?.title ?? fallbackTrans?.title ?? "";
      const description =
        requestedTrans?.description ?? fallbackTrans?.description ?? null;

      const movieGenreItems = genreRows
        .filter((g) => g.movieId === movie.id)
        .map((g) => ({ id: g.id, name: g.name }));

      return {
        id: movie.id,
        title,
        description,
        durationMinutes: movie.durationMinutes,
        releaseDate: movie.releaseDate,
        rating: movie.rating,
        posterUrl: movie.posterUrl,
        trailerUrl: movie.trailerUrl,
        genres: movieGenreItems,
      };
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Retrieves detailed movie information by UUIDv7 identifier with localized metadata and genres.
   *
   * @param id UUIDv7 movie identifier
   * @param lang Requested localization language code
   * @returns Detailed movie object
   * @throws NotFoundException when movie does not exist
   */
  async findMovieById(
    id: string,
    lang: CatalogLanguage = "vi",
  ): Promise<MovieResponseDto> {
    const [movie] = await this.db
      .select({
        id: movies.id,
        durationMinutes: movies.durationMinutes,
        releaseDate: movies.releaseDate,
        rating: movies.rating,
        posterUrl: movies.posterUrl,
        trailerUrl: movies.trailerUrl,
      })
      .from(movies)
      .where(eq(movies.id, id))
      .limit(1);

    if (!movie) {
      throw new NotFoundException(
        this.i18n.t("catalog.MOVIE_NOT_FOUND", { args: { id } }),
      );
    }

    const [translations, genreRows] = await Promise.all([
      this.db
        .select({
          languageCode: movieTranslations.languageCode,
          title: movieTranslations.title,
          description: movieTranslations.description,
        })
        .from(movieTranslations)
        .where(eq(movieTranslations.movieId, id)),
      this.db
        .select({
          id: genres.id,
          name: genres.name,
        })
        .from(movieGenres)
        .innerJoin(genres, eq(genres.id, movieGenres.genreId))
        .where(eq(movieGenres.movieId, id)),
    ]);

    const requestedTrans = translations.find((t) => t.languageCode === lang);
    const fallbackTrans =
      translations.find((t) => t.languageCode === "vi") ?? translations[0];

    const title = requestedTrans?.title ?? fallbackTrans?.title ?? "";
    const description =
      requestedTrans?.description ?? fallbackTrans?.description ?? null;

    return {
      id: movie.id,
      title,
      description,
      durationMinutes: movie.durationMinutes,
      releaseDate: movie.releaseDate,
      rating: movie.rating,
      posterUrl: movie.posterUrl,
      trailerUrl: movie.trailerUrl,
      genres: genreRows,
    };
  }
}
