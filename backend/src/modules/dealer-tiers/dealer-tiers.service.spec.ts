import { beforeEach, describe, expect, test } from "bun:test";
import { NotFoundException } from "@nestjs/common";
import { DealerTiersService } from "./dealer-tiers.service";
import type { DrizzleDB } from "@/database/database.module";
import { createMockDb } from "../../../test/mocks";

describe("DealerTiersService", () => {
  let service: DealerTiersService;
  const mockDb = createMockDb();

  beforeEach(() => {
    mockDb.clearAll();
    service = new DealerTiersService(mockDb as unknown as DrizzleDB);
  });

  describe("findAll()", () => {
    describe("when retrieving all dealer tiers", () => {
      test("should return list of dealer tiers ordered by minimum spend ascending", async () => {
        const mockTiers = [
          {
            id: "tier-1",
            nameVi: "Silver",
            nameEn: "Silver Tier",
            discountPercentage: "10.00",
            minimumSpend: "100000000.00",
          },
          {
            id: "tier-2",
            nameVi: "Gold",
            nameEn: "Gold Tier",
            discountPercentage: "15.00",
            minimumSpend: "500000000.00",
          },
        ];

        mockDb.setSelectResult(mockTiers);

        const result = await service.findAll();

        expect(mockDb.select).toHaveBeenCalled();
        expect(result).toEqual(mockTiers);
      });
    });
  });

  describe("findById()", () => {
    describe("when dealer tier exists", () => {
      test("should return dealer tier details matching target UUID", async () => {
        const mockTier = {
          id: "tier-gold",
          nameVi: "Gold",
          nameEn: "Gold Tier",
          discountPercentage: "15.00",
          minimumSpend: "500000000.00",
        };

        mockDb.setSelectResult([mockTier]);

        const result = await service.findById("tier-gold");

        expect(mockDb.select).toHaveBeenCalled();
        expect(result).toEqual(mockTier);
      });
    });

    describe("when dealer tier does not exist", () => {
      test("should throw NotFoundException naming the missing identifier", () => {
        mockDb.setSelectResult([]);

        expect(service.findById("non-existent")).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });
});
