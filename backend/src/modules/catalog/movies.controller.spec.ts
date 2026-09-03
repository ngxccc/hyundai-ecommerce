import { beforeEach, describe, expect, it, mock } from "bun:test";
import { MoviesController } from "./movies.controller";
import type { MoviesService } from "./movies.service";
import type {
  MovieDetailParamDto,
  MovieDetailQueryDto,
  MovieListQueryDto,
  MovieListResponseDto,
  MovieResponseDto,
} from "./dto";

describe("MoviesController", () => {
  let controller: MoviesController;

  const mockMovieListResponse: MovieListResponseDto = {
    data: [
      {
        id: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9a",
        title: "Dune: Part Two",
        description: "Paul Atreides unites with Chani and the Fremen.",
        durationMinutes: 166,
        releaseDate: "2024-03-01",
        rating: "PG_13",
        posterUrl: "https://example.com/poster.jpg",
        trailerUrl: "https://example.com/trailer.mp4",
        genres: [
          { id: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9b", name: "Sci-Fi" },
        ],
      },
    ],
    meta: {
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    },
  };

  const mockMovieDetailResponse: MovieResponseDto = {
    id: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9a",
    title: "Dune: Part Two",
    description: "Paul Atreides unites with Chani and the Fremen.",
    durationMinutes: 166,
    releaseDate: "2024-03-01",
    rating: "PG_13",
    posterUrl: "https://example.com/poster.jpg",
    trailerUrl: "https://example.com/trailer.mp4",
    genres: [{ id: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9b", name: "Sci-Fi" }],
  };

  const mockMoviesService = {
    findMovies: mock((_query: MovieListQueryDto) =>
      Promise.resolve(mockMovieListResponse),
    ),
    findMovieById: mock((_id: string, _lang?: string) =>
      Promise.resolve(mockMovieDetailResponse),
    ),
  };

  beforeEach(() => {
    mockMoviesService.findMovies.mockClear();
    mockMoviesService.findMovieById.mockClear();
    controller = new MoviesController(
      mockMoviesService as unknown as MoviesService,
    );
  });

  describe("when discovering movies (getMovies)", () => {
    it("should return wrapped apiSuccess response with paginated movies", async () => {
      const query: MovieListQueryDto = {
        page: 1,
        limit: 20,
        lang: "vi",
        status: "now-showing",
      };

      const response = await controller.getMovies(query);

      expect(mockMoviesService.findMovies).toHaveBeenCalledWith(query);
      expect(response).toEqual({
        success: true,
        data: mockMovieListResponse.data,
        meta: mockMovieListResponse.meta,
      });
    });
  });

  describe("when retrieving movie details by ID (getMovieById)", () => {
    it("should return wrapped apiSuccess response with movie detail", async () => {
      const param: MovieDetailParamDto = {
        id: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9a",
      };
      const query: MovieDetailQueryDto = {
        lang: "en",
      };

      const response = await controller.getMovieById(param, query);

      expect(mockMoviesService.findMovieById).toHaveBeenCalledWith(
        param.id,
        query.lang,
      );
      expect(response).toEqual({
        success: true,
        data: mockMovieDetailResponse,
      });
    });
  });
});
