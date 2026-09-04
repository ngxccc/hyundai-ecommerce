import { beforeEach, describe, expect, test } from "bun:test";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { BrandsService } from "./brands.service";
import type { DrizzleDB } from "@/database/database.module";
import { createMockDb } from "../../../test/mocks";

describe("BrandsService", () => {
  let service: BrandsService;
  const mockDb = createMockDb();

  beforeEach(() => {
    mockDb.clearAll();
    service = new BrandsService(mockDb as unknown as DrizzleDB);
  });

  describe("findAll()", () => {
    describe("when brands exist", () => {
      test("should return all brands ordered by name ascending", async () => {
        const mockBrands = [
          {
            id: "brand-1",
            name: "Hyundai Power",
            slug: "hyundai-power",
            logo: null,
            descriptionVi: null,
            descriptionEn: null,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        mockDb.setSelectResult(mockBrands);

        const result = await service.findAll();

        expect(result.length).toBe(1);
        expect(result[0]?.name).toBe("Hyundai Power");
      });
    });
  });

  describe("findById()", () => {
    describe("when brand exists", () => {
      test("should return brand details matching ID", async () => {
        const mockBrand = {
          id: "brand-target",
          name: "Cummins",
          slug: "cummins",
          logo: null,
          descriptionVi: null,
          descriptionEn: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockDb.setSelectResult([mockBrand]);

        const result = await service.findById("brand-target");

        expect(result.id).toBe("brand-target");
        expect(result.slug).toBe("cummins");
      });
    });

    describe("when brand does not exist", () => {
      test("should throw NotFoundException", () => {
        mockDb.setSelectResult([]);

        expect(service.findById("non-existent")).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });

  describe("create()", () => {
    describe("when slug already exists", () => {
      test("should throw ConflictException", () => {
        mockDb.setSelectResult([{ id: "existing-slug" }]);

        expect(
          service.create({
            name: "Hyundai",
            slug: "hyundai",
            isActive: true,
          }),
        ).rejects.toThrow(ConflictException);
      });
    });

    describe("when name already exists", () => {
      test("should throw ConflictException", () => {
        // 1st select: slug (none)
        // 2nd select: name (exists)
        mockDb.setSelectResultsQueue([[], [{ id: "existing-name" }]]);

        expect(
          service.create({
            name: "Hyundai",
            slug: "hyundai-power",
            isActive: true,
          }),
        ).rejects.toThrow(ConflictException);
      });
    });

    describe("when valid payload provided", () => {
      test("should insert and return created brand", async () => {
        const newBrand = {
          id: "brand-new",
          name: "Doosan",
          slug: "doosan",
          logo: null,
          descriptionVi: null,
          descriptionEn: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // 1st select: slug (none)
        // 2nd select: name (none)
        // 3rd returning: inserted
        mockDb.setSelectResultsQueue([[], [], [newBrand]]);

        const result = await service.create({
          name: "Doosan",
          slug: "doosan",
          isActive: true,
        });

        expect(result.id).toBe("brand-new");
        expect(result.name).toBe("Doosan");
      });
    });
  });

  describe("update()", () => {
    describe("when brand does not exist", () => {
      test("should throw NotFoundException", () => {
        mockDb.setSelectResult([]);

        expect(
          service.update("non-existent", { name: "New Name" }),
        ).rejects.toThrow(NotFoundException);
      });
    });
  });

  describe("delete()", () => {
    describe("when brand exists", () => {
      test("should delete brand record from database", async () => {
        mockDb.setSelectResult([{ id: "brand-del" }]);

        await service.delete("brand-del");

        expect(mockDb.delete).toHaveBeenCalled();
      });
    });

    describe("when brand does not exist", () => {
      test("should throw NotFoundException", () => {
        mockDb.setSelectResult([]);

        expect(service.delete("non-existent")).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });
});
