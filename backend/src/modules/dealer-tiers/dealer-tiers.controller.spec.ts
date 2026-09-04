import { beforeEach, describe, expect, test, mock } from "bun:test";
import { DealerTiersController } from "./dealer-tiers.controller";
import type { DealerTiersService } from "./dealer-tiers.service";
import type { DealerTierResponseDto } from "./dto/dealer-tier-response.dto";

describe("DealerTiersController", () => {
  let controller: DealerTiersController;

  const mockDealerTiersService = {
    findAll: mock(() =>
      Promise.resolve([
        {
          id: "tier-1",
          nameVi: "Silver",
          nameEn: "Silver Tier",
          discountPercentage: "10.00",
          minimumSpend: "100000000.00",
        },
      ] as DealerTierResponseDto[]),
    ),
    findById: mock((id: string) =>
      Promise.resolve({
        id,
        nameVi: "Gold",
        nameEn: "Gold Tier",
        discountPercentage: "15.00",
        minimumSpend: "500000000.00",
      } as DealerTierResponseDto),
    ),
    clearAll() {
      this.findAll.mockClear();
      this.findById.mockClear();
    },
  };

  beforeEach(() => {
    mockDealerTiersService.clearAll();
    controller = new DealerTiersController(
      mockDealerTiersService as unknown as DealerTiersService,
    );
  });

  describe("GET /api/v1/dealer-tiers", () => {
    describe("when client queries all dealer tiers", () => {
      test("should return apiSuccess wrapped list of dealer tiers", async () => {
        const result = await controller.getAll();

        expect(mockDealerTiersService.findAll).toHaveBeenCalled();
        expect(result).toEqual({
          success: true,
          data: [
            {
              id: "tier-1",
              nameVi: "Silver",
              nameEn: "Silver Tier",
              discountPercentage: "10.00",
              minimumSpend: "100000000.00",
            },
          ],
        });
      });
    });
  });

  describe("GET /api/v1/dealer-tiers/:id", () => {
    describe("when client queries tier by id", () => {
      test("should return apiSuccess wrapped tier details", async () => {
        const tierId = "019fa8bc-8f4d-7000-b366-e691f45cfb8f";
        const result = await controller.getById(tierId);

        expect(mockDealerTiersService.findById).toHaveBeenCalledWith(tierId);
        expect(result).toEqual({
          success: true,
          data: {
            id: tierId,
            nameVi: "Gold",
            nameEn: "Gold Tier",
            discountPercentage: "15.00",
            minimumSpend: "500000000.00",
          },
        });
      });
    });
  });
});
