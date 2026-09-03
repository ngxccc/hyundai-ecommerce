import { beforeEach, describe, expect, it } from "bun:test";
import { v7 as uuidv7 } from "uuid";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { ShowsService } from "./shows.service";
import type { DrizzleDB } from "@/database/database.module";
import type { I18nService } from "nestjs-i18n";
import { createMockDb, createMockI18nService } from "../../../test/mocks";
import {
  formatTimezoneDate,
  getFutureTimezoneDate,
} from "@/common/utils/date.util";
import { SHOWS_CONSTANTS } from "./shows.constants";
import { TIME_IN_MS } from "@/common/constants/time.constant";
import type { CreateShowBatchDto, CreateShowDto } from "./dto";

describe("ShowsService", () => {
  let service: ShowsService;
  const mockDb = createMockDb();
  const mockI18nService = createMockI18nService();

  beforeEach(() => {
    mockDb.clearAll();
    mockI18nService.clearAll();
    service = new ShowsService(
      mockDb as unknown as DrizzleDB,
      mockI18nService as unknown as I18nService,
    );
  });

  describe("findShows", () => {
    const todayStr = formatTimezoneDate(
      new Date(),
      SHOWS_CONSTANTS.DEFAULT_TIMEZONE,
    );
    const futureDateStr = getFutureTimezoneDate(
      2,
      SHOWS_CONSTANTS.DEFAULT_TIMEZONE,
    );

    describe("when querying valid showtime schedules", () => {
      it("should return mapped show schedule items with real-time seat availability when matching shows exist", async () => {
        const showId = uuidv7();
        const movieId = uuidv7();
        const hallId = uuidv7();
        const cinemaId = uuidv7();
        const startTime = new Date(Date.now() + 2 * TIME_IN_MS.HOUR);
        const endTime = new Date(startTime.getTime() + 120 * TIME_IN_MS.MINUTE);

        const mockDbRow = {
          id: showId,
          movieId,
          hallId,
          cinemaId,
          startTime,
          endTime,
          basePrice: 100000,
          movieTitle: "Deadpool & Wolverine",
          moviePosterUrl: "https://example.com/poster.jpg",
          movieDurationMinutes: 120,
          movieRating: "T18",
          cinemaName: "CGV Landmark 81",
          cinemaCity: "Ho Chi Minh City",
          cinemaStreetAddress: "720A Dien Bien Phu",
          hallName: "Hall 01 (IMAX)",
          totalSeats: 100,
          availableSeats: 85,
        };

        mockDb.setSelectResult([mockDbRow]);

        const results = await service.findShows({
          date: futureDateStr,
          lang: "vi",
          movieId,
          cinemaId,
        });

        expect(results).toHaveLength(1);
        const firstResult = results[0];
        expect(firstResult).toBeDefined();
        expect(firstResult).toEqual({
          id: showId,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          basePrice: 100000,
          availableSeats: 85,
          totalSeats: 100,
          movie: {
            id: movieId,
            title: "Deadpool & Wolverine",
            posterUrl: "https://example.com/poster.jpg",
            durationMinutes: 120,
            rating: "T18",
          },
          cinema: {
            id: cinemaId,
            name: "CGV Landmark 81",
            city: "Ho Chi Minh City",
            streetAddress: "720A Dien Bien Phu",
          },
          hall: {
            id: hallId,
            name: "Hall 01 (IMAX)",
          },
        });
      });
    });

    describe("when no shows match filter criteria", () => {
      it("should return empty array when no shows match filters", async () => {
        mockDb.setSelectResult([]);

        const results = await service.findShows({
          date: futureDateStr,
          lang: "vi",
        });

        expect(results).toEqual([]);
      });
    });

    describe("when encountering shows without pre-allocated seats", () => {
      it("should return zero total and available seats when show has no pre-allocated seat rows", async () => {
        const showId = uuidv7();
        const movieId = uuidv7();
        const hallId = uuidv7();
        const cinemaId = uuidv7();
        const startTime = new Date(Date.now() + 4 * TIME_IN_MS.HOUR);
        const endTime = new Date(startTime.getTime() + 90 * TIME_IN_MS.MINUTE);

        mockDb.setSelectResult([
          {
            id: showId,
            movieId,
            hallId,
            cinemaId,
            startTime,
            endTime,
            basePrice: 80000,
            movieTitle: "Doraemon",
            moviePosterUrl: null,
            movieDurationMinutes: 90,
            movieRating: "P",
            cinemaName: "BHD Star Bitexco",
            cinemaCity: "Ho Chi Minh City",
            cinemaStreetAddress: "2 Hai Trieu",
            hallName: "Hall 02",
            totalSeats: 0,
            availableSeats: 0,
          },
        ]);

        const results = await service.findShows({
          date: todayStr,
          lang: "vi",
        });

        expect(results).toHaveLength(1);
        const firstResult = results[0];
        expect(firstResult).toBeDefined();
        expect(firstResult?.totalSeats).toBe(0);
        expect(firstResult?.availableSeats).toBe(0);
      });
    });
  });

  describe("createShow", () => {
    const validMovieId = uuidv7();
    const validHallId = uuidv7();
    const futureStartTime = new Date(Date.now() + 2 * TIME_IN_MS.HOUR);

    const validDto: CreateShowDto = {
      movieId: validMovieId,
      hallId: validHallId,
      startTime: futureStartTime.toISOString(),
      basePrice: 100000,
    };

    describe("when creating a single showtime successfully", () => {
      it("should insert show and pre-allocate available seats when payload is valid", async () => {
        const seat1Id = uuidv7();
        const seat2Id = uuidv7();
        const createdShowId = uuidv7();
        const endTime = new Date(
          futureStartTime.getTime() + 120 * TIME_IN_MS.MINUTE,
        );

        // 1. movie query, 2. hall query, 3. hall seats query, 4. insert show returning
        mockDb.setSelectResultsQueue([
          [{ id: validMovieId, durationMinutes: 120 }],
          [{ id: validHallId }],
          [{ id: seat1Id }, { id: seat2Id }],
          [
            {
              id: createdShowId,
              movieId: validMovieId,
              hallId: validHallId,
              startTime: futureStartTime,
              endTime,
              basePrice: 100000,
            },
          ],
        ]);

        const result = await service.createShow(validDto);

        expect(result).toBeDefined();
        expect(result.id).toBe(createdShowId);
        expect(result.totalSeats).toBe(2);
      });
    });

    describe("when referenced entities do not exist", () => {
      it("should throw NotFoundException when movie is not found", () => {
        mockDb.setSelectResultsQueue([[], [{ id: validHallId }]]);

        expect(service.createShow(validDto)).rejects.toThrow(NotFoundException);
      });

      it("should throw NotFoundException when hall is not found", () => {
        mockDb.setSelectResultsQueue([
          [{ id: validMovieId, durationMinutes: 120 }],
          [],
        ]);

        expect(service.createShow(validDto)).rejects.toThrow(NotFoundException);
      });
    });

    describe("when lead time or seat prerequisites fail", () => {
      it("should throw BadRequestException when start time is in the past or violates lead time", () => {
        const pastDto: CreateShowDto = {
          movieId: validMovieId,
          hallId: validHallId,
          startTime: new Date(Date.now() - TIME_IN_MS.HOUR).toISOString(),
          basePrice: 100000,
        };
        mockDb.setSelectResultsQueue([
          [{ id: validMovieId, durationMinutes: 120 }],
          [{ id: validHallId }],
        ]);

        expect(service.createShow(pastDto)).rejects.toThrow(
          BadRequestException,
        );
      });

      it("should throw BadRequestException when hall has no physical seats configured", () => {
        mockDb.setSelectResultsQueue([
          [{ id: validMovieId, durationMinutes: 120 }],
          [{ id: validHallId }],
          [], // No seats
        ]);

        expect(service.createShow(validDto)).rejects.toThrow(
          BadRequestException,
        );
      });
    });

    describe("when database raises conflict or generic errors", () => {
      it("should throw ConflictException when exclusion constraint collision occurs", () => {
        mockDb.setSelectResultsQueue([
          [{ id: validMovieId, durationMinutes: 120 }],
          [{ id: validHallId }],
          [{ id: uuidv7() }],
        ]);

        const pgCollisionError = new Error("exclusion_violation");
        Object.assign(pgCollisionError, { code: "23P01" });

        mockDb.insert.mockImplementationOnce(() => {
          throw pgCollisionError;
        });

        expect(service.createShow(validDto)).rejects.toThrow(ConflictException);
      });
    });
  });

  describe("createShowBatch", () => {
    const validMovieId = uuidv7();
    const validHallId = uuidv7();
    const startDate = getFutureTimezoneDate(
      1,
      SHOWS_CONSTANTS.DEFAULT_TIMEZONE,
    );
    const endDate = getFutureTimezoneDate(2, SHOWS_CONSTANTS.DEFAULT_TIMEZONE);

    const validBatchDto: CreateShowBatchDto = {
      movieId: validMovieId,
      hallId: validHallId,
      startDate,
      endDate,
      timeSlots: ["10:00", "14:00"],
      basePrice: 100000,
    };

    describe("when creating batch showtimes successfully", () => {
      it("should insert multiple shows and pre-allocate seats in chunks when payload is valid", async () => {
        const show1Id = uuidv7();
        const show2Id = uuidv7();
        const show3Id = uuidv7();
        const show4Id = uuidv7();

        mockDb.setSelectResultsQueue([
          [{ id: validMovieId, durationMinutes: 120 }],
          [{ id: validHallId }],
          [{ id: uuidv7() }, { id: uuidv7() }],
          [{ id: show1Id }, { id: show2Id }, { id: show3Id }, { id: show4Id }],
        ]);

        const result = await service.createShowBatch(validBatchDto);

        expect(result.createdCount).toBe(4);
        expect(result.showIds).toHaveLength(4);
      });
    });

    describe("when referenced entities do not exist", () => {
      it("should throw NotFoundException when movie is not found", () => {
        mockDb.setSelectResultsQueue([[], [{ id: validHallId }]]);

        expect(service.createShowBatch(validBatchDto)).rejects.toThrow(
          NotFoundException,
        );
      });

      it("should throw NotFoundException when hall is not found", () => {
        mockDb.setSelectResultsQueue([
          [{ id: validMovieId, durationMinutes: 120 }],
          [],
        ]);

        expect(service.createShowBatch(validBatchDto)).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe("when database raises conflict error", () => {
      it("should throw ConflictException when PostgreSQL returns 23P01 exclusion violation", () => {
        mockDb.setSelectResultsQueue([
          [{ id: validMovieId, durationMinutes: 120 }],
          [{ id: validHallId }],
          [{ id: uuidv7() }],
        ]);

        const pgCollisionError = new Error("exclusion_violation");
        Object.assign(pgCollisionError, { code: "23P01" });

        mockDb.insert.mockImplementationOnce(() => {
          throw pgCollisionError;
        });

        expect(service.createShowBatch(validBatchDto)).rejects.toThrow(
          ConflictException,
        );
      });
    });
  });

  describe("expandAndValidateTimeline", () => {
    const futureDate1 = getFutureTimezoneDate(
      1,
      SHOWS_CONSTANTS.DEFAULT_TIMEZONE,
    );
    const futureDate2 = getFutureTimezoneDate(
      2,
      SHOWS_CONSTANTS.DEFAULT_TIMEZONE,
    );

    describe("when timeline configuration is valid", () => {
      it("should return chronologically sorted time slots with buffer when intervals do not overlap", () => {
        const dto: CreateShowBatchDto = {
          movieId: uuidv7(),
          hallId: uuidv7(),
          startDate: futureDate1,
          endDate: futureDate2,
          timeSlots: ["10:00", "14:00"],
          basePrice: 100000,
        };

        const slots = service.expandAndValidateTimeline(dto, 120);

        expect(slots).toHaveLength(4);
        expect(slots[0]?.startTime.getTime()).toBeLessThan(
          slots[1]?.startTime.getTime() ?? 0,
        );
      });
    });

    describe("when date parameters or ranges are malformed", () => {
      it("should throw BadRequestException when date range components are invalid", () => {
        const dto = {
          movieId: uuidv7(),
          hallId: uuidv7(),
          startDate: "invalid",
          endDate: futureDate2,
          timeSlots: ["10:00"],
          basePrice: 100000,
        };

        expect(() => service.expandAndValidateTimeline(dto, 120)).toThrow(
          BadRequestException,
        );
      });

      it("should throw BadRequestException when start date is after end date", () => {
        const dto: CreateShowBatchDto = {
          movieId: uuidv7(),
          hallId: uuidv7(),
          startDate: futureDate2,
          endDate: futureDate1,
          timeSlots: ["10:00"],
          basePrice: 100000,
        };

        expect(() => service.expandAndValidateTimeline(dto, 120)).toThrow(
          BadRequestException,
        );
      });

      it("should throw BadRequestException when date range exceeds max batch days", () => {
        const farFutureDate = getFutureTimezoneDate(
          35,
          SHOWS_CONSTANTS.DEFAULT_TIMEZONE,
        );
        const dto: CreateShowBatchDto = {
          movieId: uuidv7(),
          hallId: uuidv7(),
          startDate: futureDate1,
          endDate: farFutureDate,
          timeSlots: ["10:00"],
          basePrice: 100000,
        };

        expect(() => service.expandAndValidateTimeline(dto, 120)).toThrow(
          BadRequestException,
        );
      });

      it("should throw BadRequestException when total expected shows exceed max allowed shows", () => {
        const farFutureDate = getFutureTimezoneDate(
          25,
          SHOWS_CONSTANTS.DEFAULT_TIMEZONE,
        );
        const dto: CreateShowBatchDto = {
          movieId: uuidv7(),
          hallId: uuidv7(),
          startDate: futureDate1,
          endDate: farFutureDate,
          timeSlots: ["08:00", "10:00", "12:00", "14:00", "16:00"], // 25 * 5 = 125 > 100
          basePrice: 100000,
        };

        expect(() => service.expandAndValidateTimeline(dto, 60)).toThrow(
          BadRequestException,
        );
      });
    });

    describe("when time slot overlap or lead time is violated", () => {
      it("should throw BadRequestException when time slots collide intra-batch within cleaning buffer", () => {
        const dto: CreateShowBatchDto = {
          movieId: uuidv7(),
          hallId: uuidv7(),
          startDate: futureDate1,
          endDate: futureDate1,
          timeSlots: ["10:00", "11:00"], // 120m duration -> 10:00-12:00 + 15m buffer -> 12:15 collides with 11:00
          basePrice: 100000,
        };

        expect(() => service.expandAndValidateTimeline(dto, 120)).toThrow(
          BadRequestException,
        );
      });
    });
  });
});
