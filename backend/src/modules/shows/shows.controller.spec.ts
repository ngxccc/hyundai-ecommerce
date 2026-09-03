import { beforeEach, describe, expect, it, mock } from "bun:test";
import { v7 as uuidv7 } from "uuid";
import { ShowsController } from "./shows.controller";
import type { ShowsService } from "./shows.service";
import type {
  CreateShowBatchDto,
  CreateShowDto,
  ShowScheduleItemDto,
  ShowScheduleQueryDto,
} from "./dto";

describe("ShowsController", () => {
  let controller: ShowsController;

  const mockScheduleItem: ShowScheduleItemDto = {
    id: uuidv7(),
    startTime: "2026-09-02T10:00:00.000Z",
    endTime: "2026-09-02T12:00:00.000Z",
    basePrice: 100000,
    availableSeats: 90,
    totalSeats: 100,
    movie: {
      id: uuidv7(),
      title: "Deadpool & Wolverine",
      posterUrl: "https://example.com/poster.jpg",
      durationMinutes: 120,
      rating: "T18",
    },
    cinema: {
      id: uuidv7(),
      name: "CGV Landmark 81",
      city: "Ho Chi Minh City",
      streetAddress: "720A Dien Bien Phu",
    },
    hall: {
      id: uuidv7(),
      name: "Hall 01 (IMAX)",
    },
  };

  const mockShowsService = {
    findShows: mock((_query: ShowScheduleQueryDto) =>
      Promise.resolve([mockScheduleItem]),
    ),
    createShow: mock((_dto: CreateShowDto) =>
      Promise.resolve({
        id: uuidv7(),
        movieId: uuidv7(),
        hallId: uuidv7(),
        startTime: "2026-09-02T10:00:00.000Z",
        endTime: "2026-09-02T12:00:00.000Z",
        basePrice: 100000,
        totalSeats: 100,
        createdAt: "2026-09-01T00:00:00.000Z",
        updatedAt: "2026-09-01T00:00:00.000Z",
      }),
    ),
    createShowBatch: mock((_dto: CreateShowBatchDto) =>
      Promise.resolve({
        createdCount: 10,
        showIds: [uuidv7()],
      }),
    ),
  };

  beforeEach(() => {
    mockShowsService.findShows.mockClear();
    mockShowsService.createShow.mockClear();
    mockShowsService.createShowBatch.mockClear();
    controller = new ShowsController(
      mockShowsService as unknown as ShowsService,
    );
  });

  describe("GET /shows", () => {
    describe("when querying showtime schedules", () => {
      it("should return apiSuccess envelope with list of show schedule items when query is valid", async () => {
        const query: ShowScheduleQueryDto = {
          date: "2026-09-02",
          lang: "vi",
        };

        const response = await controller.getShows(query);

        expect(response.success).toBe(true);
        expect(response.data).toEqual([mockScheduleItem]);
        expect(mockShowsService.findShows).toHaveBeenCalledWith(query);
      });
    });
  });

  describe("POST /shows", () => {
    describe("when creating a single showtime", () => {
      it("should return apiSuccess envelope with created show when payload is valid", async () => {
        const dto: CreateShowDto = {
          movieId: uuidv7(),
          hallId: uuidv7(),
          startTime: "2026-09-02T10:00:00.000Z",
          basePrice: 100000,
        };

        const response = await controller.createShow(dto);

        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();
        expect(mockShowsService.createShow).toHaveBeenCalledWith(dto);
      });
    });
  });

  describe("POST /shows/batch", () => {
    describe("when creating recurring batch showtimes", () => {
      it("should return apiSuccess envelope with batch creation summary when payload is valid", async () => {
        const dto: CreateShowBatchDto = {
          movieId: uuidv7(),
          hallId: uuidv7(),
          startDate: "2026-09-02",
          endDate: "2026-09-04",
          timeSlots: ["10:00", "14:00"],
          basePrice: 100000,
        };

        const response = await controller.createShowBatch(dto);

        expect(response.success).toBe(true);
        expect(response.data.createdCount).toBe(10);
        expect(mockShowsService.createShowBatch).toHaveBeenCalledWith(dto);
      });
    });
  });
});
