import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "bun:test";
import { v7 as uuidv7 } from "uuid";
import request from "supertest";
import type { INestApplication } from "@nestjs/common";
import type { Server } from "node:http";
import {
  createTestApp,
  teardownTestApp,
  type TestAppSetup,
} from "../helpers/app.helper";
import { truncateAllTables } from "@/database/database.connection";
import type { DrizzleDB } from "@/database/database.module";
import {
  createGenre,
  createMovie,
  createMovieTranslation,
  linkMovieGenre,
} from "../factories/movie.factory";
import { createShow } from "../factories/show.factory";
import type { ApiResponse } from "@/common/utils/api-response.util";
import type {
  PaginationMetaDto,
  MovieResponseDto,
} from "@/modules/catalog/dto";
import type { Rfc9457ErrorResponse } from "@/common/filters/global-exception.filter";

describe("Catalog Module Integration - Movies", () => {
  let setup: TestAppSetup;
  let app: INestApplication;
  let db: DrizzleDB;
  const getHttpServer = (): Server => app.getHttpServer() as Server;

  beforeAll(async () => {
    setup = await createTestApp();
    app = setup.app;
    db = setup.db;
  }, 30000);

  afterAll(async () => {
    await teardownTestApp(setup);
  });

  beforeEach(async () => {
    await truncateAllTables(db, setup.workerSchema);
  });

  describe("GET /movies", () => {
    describe("when querying paginated movie list", () => {
      it("should return 200 OK with paginated movies and default lang=vi (INV-4)", async () => {
        const movie1 = await createMovie(db, {
          releaseDate: "2026-01-01",
          durationMinutes: 120,
          rating: "PG",
        });
        await createMovieTranslation(
          db,
          movie1.id,
          "vi",
          "Phim Hành Động 1",
          "Mô tả 1",
        );

        const movie2 = await createMovie(db, {
          releaseDate: "2026-02-01",
          durationMinutes: 90,
          rating: "G",
        });
        await createMovieTranslation(
          db,
          movie2.id,
          "vi",
          "Phim Hoạt Hình 2",
          "Mô tả 2",
        );

        const res = await request(getHttpServer()).get(
          "/movies?page=1&limit=10",
        );

        expect(res.status).toBe(200);
        const body = res.body as unknown as ApiResponse<
          MovieResponseDto[],
          PaginationMetaDto
        >;
        expect(body.success).toBe(true);
        expect(Array.isArray(body.data)).toBe(true);
        expect(body.data.length).toBe(2);
        expect(body.meta).toBeDefined();
        expect(body.meta?.page).toBe(1);
        expect(body.meta?.limit).toBe(10);
        expect(body.meta?.total).toBe(2);
        expect(body.meta?.totalPages).toBe(1);
      });

      it("should filter movies by status=now-showing requiring future active showtime (INV-1)", async () => {
        // Movie A has a future showtime -> now-showing
        const movieWithShow = await createMovie(db, {
          releaseDate: "2026-01-01",
        });
        await createMovieTranslation(
          db,
          movieWithShow.id,
          "vi",
          "Phim Đang Chiếu",
        );
        await createShow(db, {
          movieId: movieWithShow.id,
          startTime: new Date(Date.now() + 3600000), // +1 hour
          endTime: new Date(Date.now() + 7200000),
        });

        // Movie B has NO showtime -> not now-showing
        const movieWithoutShow = await createMovie(db, {
          releaseDate: "2026-01-01",
        });
        await createMovieTranslation(
          db,
          movieWithoutShow.id,
          "vi",
          "Phim Không Có Suất",
        );

        const res = await request(getHttpServer()).get(
          "/movies?status=now-showing",
        );

        expect(res.status).toBe(200);
        const body = res.body as unknown as ApiResponse<
          MovieResponseDto[],
          PaginationMetaDto
        >;
        expect(body.data.length).toBe(1);
        expect(body.data[0]?.id).toBe(movieWithShow.id);
        expect(body.data[0]?.title).toBe("Phim Đang Chiếu");
      });

      it("should filter movies by status=coming-soon with future release date (INV-1)", async () => {
        const futureDate = "2029-12-31";
        const pastDate = "2020-01-01";

        const upcomingMovie = await createMovie(db, {
          releaseDate: futureDate,
        });
        await createMovieTranslation(
          db,
          upcomingMovie.id,
          "vi",
          "Phim Sắp Ra Mắt",
        );

        const releasedMovie = await createMovie(db, { releaseDate: pastDate });
        await createMovieTranslation(
          db,
          releasedMovie.id,
          "vi",
          "Phim Đã Ra Mắt",
        );

        const res = await request(getHttpServer()).get(
          "/movies?status=coming-soon",
        );

        expect(res.status).toBe(200);
        const body = res.body as unknown as ApiResponse<
          MovieResponseDto[],
          PaginationMetaDto
        >;
        expect(body.data.length).toBe(1);
        expect(body.data[0]?.id).toBe(upcomingMovie.id);
      });

      it("should filter movies by genreId (INV-3)", async () => {
        const genreAction = await createGenre(db, { name: "Action" });
        const genreDrama = await createGenre(db, { name: "Drama" });

        const movieAction = await createMovie(db);
        await createMovieTranslation(
          db,
          movieAction.id,
          "vi",
          "Phim Hành Động",
        );
        await linkMovieGenre(db, movieAction.id, genreAction.id);

        const movieDrama = await createMovie(db);
        await createMovieTranslation(db, movieDrama.id, "vi", "Phim Tâm Lý");
        await linkMovieGenre(db, movieDrama.id, genreDrama.id);

        const res = await request(getHttpServer()).get(
          `/movies?genreId=${genreAction.id}`,
        );

        expect(res.status).toBe(200);
        const body = res.body as unknown as ApiResponse<
          MovieResponseDto[],
          PaginationMetaDto
        >;
        expect(body.data.length).toBe(1);
        expect(body.data[0]?.id).toBe(movieAction.id);
        expect(body.data[0]?.genres).toBeDefined();
        expect(body.data[0]?.genres[0]?.id).toBe(genreAction.id);
      });

      it("should filter movies by rating (INV-3)", async () => {
        const movieR = await createMovie(db, { rating: "R" });
        await createMovieTranslation(db, movieR.id, "vi", "Phim Nhãn R");

        const movieG = await createMovie(db, { rating: "G" });
        await createMovieTranslation(db, movieG.id, "vi", "Phim Nhãn G");

        const res = await request(getHttpServer()).get("/movies?rating=R");

        expect(res.status).toBe(200);
        const body = res.body as unknown as ApiResponse<
          MovieResponseDto[],
          PaginationMetaDto
        >;
        expect(body.data.length).toBe(1);
        expect(body.data[0]?.id).toBe(movieR.id);
      });

      it("should perform cross-language title search across all translations (INV-3)", async () => {
        const movie = await createMovie(db);
        await createMovieTranslation(db, movie.id, "vi", "Kỵ Sĩ Bóng Đêm");
        await createMovieTranslation(db, movie.id, "en", "The Dark Knight");

        // Searching English title while requesting vi locale
        const res = await request(getHttpServer()).get(
          "/movies?search=Dark%20Knight&lang=vi",
        );

        expect(res.status).toBe(200);
        const body = res.body as unknown as ApiResponse<
          MovieResponseDto[],
          PaginationMetaDto
        >;
        expect(body.data.length).toBe(1);
        expect(body.data[0]?.id).toBe(movie.id);
        expect(body.data[0]?.title).toBe("Kỵ Sĩ Bóng Đêm");
      });

      it("should sanitize SQL wildcards (% and _) in search string (INV-3)", async () => {
        const movie1 = await createMovie(db);
        await createMovieTranslation(db, movie1.id, "vi", "100% Love");

        const movie2 = await createMovie(db);
        await createMovieTranslation(db, movie2.id, "vi", "Normal Movie");

        const res = await request(getHttpServer()).get("/movies?search=100%");

        expect(res.status).toBe(200);
        const body = res.body as unknown as ApiResponse<
          MovieResponseDto[],
          PaginationMetaDto
        >;
        expect(body.data.length).toBe(1);
        expect(body.data[0]?.id).toBe(movie1.id);
      });

      it("should return 200 OK with empty data array when no movies match criteria (INV-4)", async () => {
        const res = await request(getHttpServer()).get(
          "/movies?search=NonExistentMovie9999",
        );

        expect(res.status).toBe(200);
        const body = res.body as unknown as ApiResponse<
          MovieResponseDto[],
          PaginationMetaDto
        >;
        expect(body.success).toBe(true);
        expect(body.data).toEqual([]);
        expect(body.meta?.total).toBe(0);
        expect(body.meta?.totalPages).toBe(0);
      });

      it("should fall back deterministically to primary locale vi when requested en translation is missing (INV-2)", async () => {
        const movie = await createMovie(db);
        await createMovieTranslation(
          db,
          movie.id,
          "vi",
          "Tiêu Đề Gốc Tiếng Việt",
          "Mô tả tiếng Việt",
        );

        const res = await request(getHttpServer()).get(`/movies?lang=en`);

        expect(res.status).toBe(200);
        const body = res.body as unknown as ApiResponse<
          MovieResponseDto[],
          PaginationMetaDto
        >;
        expect(body.data.length).toBe(1);
        expect(body.data[0]?.title).toBe("Tiêu Đề Gốc Tiếng Việt");
        expect(body.data[0]?.description).toBe("Mô tả tiếng Việt");
      });

      it("should reject snake_case status value with 400 Bad Request", async () => {
        const res = await request(getHttpServer()).get(
          "/movies?status=now_showing",
        );
        expect(res.status).toBe(400);
        const body = res.body as unknown as Rfc9457ErrorResponse;
        expect(body.title).toBe("Bad Request");
        expect(body.invalidParams).toBeDefined();
      });

      it("should reject page < 1 with 400 Bad Request (INV-4)", async () => {
        const res = await request(getHttpServer()).get("/movies?page=0");

        expect(res.status).toBe(400);
        const body = res.body as unknown as Rfc9457ErrorResponse;
        expect(body.title).toBe("Bad Request");
      });

      it("should reject limit > 100 with 400 Bad Request (INV-4)", async () => {
        const res = await request(getHttpServer()).get("/movies?limit=101");

        expect(res.status).toBe(400);
        const body = res.body as unknown as Rfc9457ErrorResponse;
        expect(body.title).toBe("Bad Request");
      });
    });
  });

  describe("GET /movies/:id", () => {
    describe("when fetching movie details by UUIDv7 identifier", () => {
      it("should return 200 OK with detailed movie metadata and structured genres (INV-5)", async () => {
        const genre = await createGenre(db, { name: "Sci-Fi" });
        const movie = await createMovie(db, {
          durationMinutes: 148,
          releaseDate: "2026-07-16",
          rating: "PG_13",
          posterUrl: "https://cdn.example.com/inception.jpg",
          trailerUrl: "https://youtube.com/watch?v=inception",
        });
        await createMovieTranslation(
          db,
          movie.id,
          "vi",
          "Kẻ Đánh Cắp Giấc Mơ",
          "Mô tả Inception",
        );
        await linkMovieGenre(db, movie.id, genre.id);

        const res = await request(getHttpServer()).get(
          `/movies/${movie.id}?lang=vi`,
        );

        expect(res.status).toBe(200);
        const body = res.body as unknown as ApiResponse<MovieResponseDto>;
        expect(body.success).toBe(true);
        expect(body.data.id).toBe(movie.id);
        expect(body.data.title).toBe("Kẻ Đánh Cắp Giấc Mơ");
        expect(body.data.description).toBe("Mô tả Inception");
        expect(body.data.durationMinutes).toBe(148);
        expect(body.data.rating).toBe("PG_13");
        expect(body.data.genres).toEqual([{ id: genre.id, name: "Sci-Fi" }]);
      });

      it("should return 400 Bad Request when movie id is not a valid UUIDv7 (INV-5)", async () => {
        const res = await request(getHttpServer()).get("/movies/not-a-uuid");

        expect(res.status).toBe(400);
        const body = res.body as unknown as Rfc9457ErrorResponse;
        expect(body.title).toBe("Bad Request");
        expect(body.invalidParams).toBeDefined();
      });

      it("should return 404 Not Found with RFC 9457 details when movie does not exist (INV-5)", async () => {
        const nonExistentId = uuidv7();
        const res = await request(getHttpServer()).get(
          `/movies/${nonExistentId}`,
        );

        expect(res.status).toBe(404);
        const body = res.body as unknown as Rfc9457ErrorResponse;
        expect(body.title).toBe("Not Found");
        expect(body.detail).toContain(nonExistentId);
      });

      it("should return localized details with fallback to vi when requested en is missing (INV-2)", async () => {
        const movie = await createMovie(db);
        await createMovieTranslation(
          db,
          movie.id,
          "vi",
          "Phim Tiếng Việt",
          "Chi tiết tiếng Việt",
        );

        const res = await request(getHttpServer()).get(
          `/movies/${movie.id}?lang=en`,
        );

        expect(res.status).toBe(200);
        const body = res.body as unknown as ApiResponse<MovieResponseDto>;
        expect(body.data.title).toBe("Phim Tiếng Việt");
        expect(body.data.description).toBe("Chi tiết tiếng Việt");
      });
    });
  });
});
