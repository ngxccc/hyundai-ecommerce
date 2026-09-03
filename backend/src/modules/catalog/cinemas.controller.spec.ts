import { beforeEach, describe, expect, it, mock } from "bun:test";
import { CinemasController } from "./cinemas.controller";
import type { CinemasService } from "./cinemas.service";
import type { CinemaListQueryDto, CinemaListResponseDto } from "./dto";

describe("CinemasController", () => {
  let controller: CinemasController;

  const mockCinemaListResponse: CinemaListResponseDto = {
    data: [
      {
        id: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9c",
        name: "Cinema Star Center",
        streetAddress: "123 Nguyen Hue",
        ward: "Ben Nghe",
        city: "Ho Chi Minh",
        postalCode: "70000",
        latitude: "10.77810000",
        longitude: "106.70250000",
        totalHalls: 8,
      },
    ],
    meta: {
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    },
  };

  const mockCinemasService = {
    findCinemas: mock((_query: CinemaListQueryDto) =>
      Promise.resolve(mockCinemaListResponse),
    ),
  };

  beforeEach(() => {
    mockCinemasService.findCinemas.mockClear();
    controller = new CinemasController(
      mockCinemasService as unknown as CinemasService,
    );
  });

  describe("when discovering cinemas (getCinemas)", () => {
    it("should return wrapped apiSuccess response with paginated cinemas", async () => {
      const query: CinemaListQueryDto = {
        page: 1,
        limit: 20,
        city: "Ho Chi Minh",
      };

      const response = await controller.getCinemas(query);

      expect(mockCinemasService.findCinemas).toHaveBeenCalledWith(query);
      expect(response).toEqual({
        success: true,
        data: mockCinemaListResponse.data,
        meta: mockCinemaListResponse.meta,
      });
    });
  });
});
