import { beforeEach, describe, expect, it } from "bun:test";
import { NotFoundException } from "@nestjs/common";
import { MoviesService } from "./movies.service";
import type { DrizzleDB } from "@/database/database.module";
import type { I18nService } from "nestjs-i18n";
import { createMockDb, createMockI18nService } from "../../../test/mocks";

describe("MoviesService (Unit)", () => {
  let service: MoviesService;
  const mockDb = createMockDb();
  const mockI18nService = createMockI18nService();

  beforeEach(() => {
    mockDb.clearAll();
    mockI18nService.clearAll();
    service = new MoviesService(
      mockDb as unknown as DrizzleDB,
      mockI18nService as unknown as I18nService,
    );
  });

  describe("findMovies", () => {
    it("should return empty list when total count is 0", async () => {
      mockDb.setSelectResult([{ count: 0 }]);

      const result = await service.findMovies({
        page: 1,
        limit: 20,
        lang: "vi",
      });

      expect(result).toEqual({
        data: [],
        meta: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      });
    });

    it("should return paginated movies with localized translations and genres", async () => {
      const mockMovie = {
        id: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9a",
        durationMinutes: 120,
        releaseDate: "2024-05-01",
        rating: "PG_13",
        posterUrl: "https://example.com/poster.jpg",
        trailerUrl: "https://example.com/trailer.mp4",
      };

      const mockTranslation = {
        movieId: mockMovie.id,
        languageCode: "vi",
        title: "Hành Tinh Cát",
        description: "Mô tả phim",
      };

      const mockGenre = {
        movieId: mockMovie.id,
        id: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9b",
        name: "Hành động",
      };

      mockDb.setSelectResultsQueue([
        [{ count: 1 }], // count
        [mockMovie], // movie rows
        [mockTranslation], // translations
        [mockGenre], // genres
      ]);

      const result = await service.findMovies({
        page: 1,
        limit: 20,
        lang: "vi",
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.id).toBe(mockMovie.id);
      expect(result.data[0]?.title).toBe("Hành Tinh Cát");
      expect(result.data[0]?.genres).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe("findMovieById", () => {
    it("should throw NotFoundException when movie does not exist", () => {
      mockDb.setSelectResult([]);

      expect(
        service.findMovieById("018f3a5e-7a2e-7b56-b74c-419b4eb14b9a"),
      ).rejects.toThrow(NotFoundException);
    });

    it("should return movie details with localized title and genres", async () => {
      const mockMovie = {
        id: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9a",
        durationMinutes: 120,
        releaseDate: "2024-05-01",
        rating: "PG_13",
        posterUrl: "https://example.com/poster.jpg",
        trailerUrl: "https://example.com/trailer.mp4",
      };

      const mockTranslation = {
        languageCode: "en",
        title: "Dune",
        description: "Dune movie description",
      };

      const mockGenre = {
        id: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9b",
        name: "Sci-Fi",
      };

      mockDb.setSelectResultsQueue([
        [mockMovie],
        [mockTranslation],
        [mockGenre],
      ]);

      const result = await service.findMovieById(mockMovie.id, "en");

      expect(result.id).toBe(mockMovie.id);
      expect(result.title).toBe("Dune");
      expect(result.genres).toHaveLength(1);
      expect(result.genres[0]?.name).toBe("Sci-Fi");
    });
  });
});
