import { expect, test, describe, vi, beforeEach } from "bun:test";
import {
  mockDb,
  mockInsert,
  mockUpdate,
  mockDelete,
  mockReturning,
  mockFindFirst,
  mockFindMany,
} from "../../tests/utils/db-mock";
import { DbDealerTierService } from "./dealer-tier.service";
import { type TDealerTier } from "../../schemas";
import type { IDatabase } from "../../client";

const dealerTierService = new DbDealerTierService(mockDb as unknown as IDatabase);

describe("DealerTierService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("create() should insert and return the created dealer tier", async () => {
    const mockTier: TDealerTier = {
      id: "tier-1",
      nameVi: "Gold Partner",
      nameEn: null,
      discountPercentage: "15.00",
      minimumSpend: "50000.00",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockReturning.mockResolvedValueOnce([mockTier]);

    const result = await dealerTierService.create({
      nameVi: "Gold Partner",
      nameEn: null,
      discountPercentage: "15.00",
      minimumSpend: "50000.00",
    });

    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockTier);
  });

  test("update() should update and return the dealer tier", async () => {
    const mockTier: TDealerTier = {
      id: "tier-1",
      nameVi: "Gold Partner V2",
      nameEn: null,
      discountPercentage: "18.00",
      minimumSpend: "50000.00",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockReturning.mockResolvedValueOnce([mockTier]);

    const result = await dealerTierService.update("tier-1", {
      nameVi: "Gold Partner V2",
      nameEn: null,
      discountPercentage: "18.00",
    });

    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockTier);
  });

  test("getAll() should return a list of all dealer tiers", async () => {
    const mockTiers: TDealerTier[] = [
      {
        id: "tier-1",
        nameVi: "Bronze Partner",
        nameEn: null,
        discountPercentage: "5.00",
        minimumSpend: "10000.00",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "tier-2",
        nameVi: "Silver Partner",
        nameEn: null,
        discountPercentage: "10.00",
        minimumSpend: "25000.00",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    mockFindMany.mockResolvedValueOnce(mockTiers);

    const result = await dealerTierService.getAll();

    expect(mockFindMany).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockTiers);
  });

  test("getById() should return a single dealer tier by id", async () => {
    const mockTier: TDealerTier = {
      id: "tier-1",
      nameVi: "Gold Partner",
      nameEn: null,
      discountPercentage: "15.00",
      minimumSpend: "50000.00",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockFindFirst.mockResolvedValueOnce(mockTier);

    const result = await dealerTierService.getById("tier-1");

    expect(mockFindFirst).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockTier);
  });

  test("delete() should delete and return true", async () => {
    mockReturning.mockResolvedValueOnce([{ id: "tier-1" }]);

    const result = await dealerTierService.delete("tier-1");

    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });
});
