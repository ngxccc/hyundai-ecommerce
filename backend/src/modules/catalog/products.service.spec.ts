import { beforeEach, describe, expect, test } from "bun:test";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { ProductsService } from "./products.service";
import type { DrizzleDB } from "@/database/database.module";
import type { I18nService } from "nestjs-i18n";
import { createMockDb, createMockI18nService } from "../../../test/mocks";

describe("ProductsService", () => {
  let service: ProductsService;
  const mockDb = createMockDb();
  const mockI18nService = createMockI18nService();

  beforeEach(() => {
    mockDb.clearAll();
    mockI18nService.clearAll();
    service = new ProductsService(
      mockDb as unknown as DrizzleDB,
      mockI18nService as unknown as I18nService,
    );
  });

  describe("findProducts()", () => {
    describe("when products match filter criteria", () => {
      test("should calculate offset pagination and return items with metadata", async () => {
        const mockProduct = {
          id: "prod-1",
          nameVi: "Máy phát điện Hyundai 60kVA",
          nameEn: "Hyundai 60kVA Generator",
          slug: "may-phat-dien-hyundai-60kva",
          price: "245000000.00",
          descriptionVi: null,
          descriptionEn: null,
          shortDescriptionVi: null,
          shortDescriptionEn: null,
          images: [],
          brandId: "brand-1",
          categoryId: "cat-1",
          productType: "generator" as const,
          powerKva: "60.00",
          powerKw: "48.00",
          standbyPowerKva: "66.00",
          standbyPowerKw: "52.80",
          phase: "3phase" as const,
          voltage: "230/400V",
          frequency: 50,
          fuelType: "diesel" as const,
          canopyType: "silent" as const,
          startMethod: "electric" as const,
          engineBrand: "Hyundai",
          alternatorBrand: "Hyundai",
          upsTopology: null,
          upsBatteryType: null,
          specSheet: [],
          specs: { model: "DHY65KSE" },
          totalStockCache: 5,
          totalSalesCache: 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        };

        // 1st select: count query -> returns total: 1
        // 2nd select: paginated records join -> returns [record]
        mockDb.setSelectResultsQueue([
          [{ total: 1 }],
          [
            {
              product: mockProduct,
              brand: {
                id: "brand-1",
                name: "Hyundai Power",
                slug: "hyundai-power",
              },
              category: {
                id: "cat-1",
                nameVi: "Máy phát điện",
                nameEn: "Generators",
                slug: "may-phat-dien",
              },
            },
          ],
        ]);

        const result = await service.findProducts({
          page: 1,
          limit: 10,
          sort: "newest",
        });

        expect(result.meta.page).toBe(1);
        expect(result.meta.limit).toBe(10);
        expect(result.meta.total).toBe(1);
        expect(result.meta.totalPages).toBe(1);
        expect(result.meta.hasNextPage).toBe(false);
        expect(result.meta.hasPrevPage).toBe(false);
        expect(result.items.length).toBe(1);
        expect(result.items[0]?.nameVi).toBe("Máy phát điện Hyundai 60kVA");
        expect(result.items[0]?.brand?.name).toBe("Hyundai Power");
      });
    });

    describe("when no products match criteria", () => {
      test("should return empty items array and zero total in meta", async () => {
        mockDb.setSelectResult([{ total: 0 }]);

        const result = await service.findProducts({
          page: 2,
          limit: 20,
          search: "nonexistent",
          sort: "newest",
        });

        expect(result.items).toEqual([]);
        expect(result.meta.total).toBe(0);
        expect(result.meta.page).toBe(2);
      });
    });
  });

  describe("getMetadata()", () => {
    describe("when querying facet filter metadata", () => {
      test("should aggregate ranges and counts for brands, categories, fuelTypes", async () => {
        // 1. ranges: min/max
        // 2. brandCounts
        // 3. categoryCounts
        // 4. fuelTypeCounts
        // 5. phaseCounts
        // 6. canopyTypeCounts
        mockDb.setSelectResultsQueue([
          [
            {
              minPower: "10.00",
              maxPower: "500.00",
              minPrice: "50000000.00",
              maxPrice: "1500000000.00",
            },
          ],
          [{ id: "brand-1", name: "Hyundai Power", count: 12 }],
          [
            {
              id: "cat-1",
              nameVi: "Máy phát điện",
              nameEn: "Generators",
              count: 15,
            },
          ],
          [{ value: "diesel", count: 10 }],
          [{ value: "3phase", count: 8 }],
          [{ value: "silent", count: 7 }],
        ]);

        const metadata = await service.getMetadata();

        expect(metadata.powerRange.min).toBe(10);
        expect(metadata.powerRange.max).toBe(500);
        expect(metadata.priceRange.min).toBe(50000000);
        expect(metadata.brands.length).toBe(1);
        expect(metadata.categories.length).toBe(1);
        expect(metadata.fuelTypes[0]?.value).toBe("diesel");
      });
    });
  });

  describe("findById()", () => {
    describe("when product exists", () => {
      test("should return product details", async () => {
        const mockProduct = {
          id: "prod-uuid",
          nameVi: "Máy phát điện DHY65KSE",
          nameEn: "DHY65KSE Generator",
          slug: "dhy65kse",
          price: "245000000.00",
          descriptionVi: null,
          descriptionEn: null,
          shortDescriptionVi: null,
          shortDescriptionEn: null,
          images: [],
          brandId: null,
          categoryId: null,
          productType: "generator" as const,
          powerKva: "60.00",
          powerKw: "48.00",
          standbyPowerKva: null,
          standbyPowerKw: null,
          phase: "3phase" as const,
          voltage: "400V",
          frequency: 50,
          fuelType: "diesel" as const,
          canopyType: "silent" as const,
          startMethod: "electric" as const,
          engineBrand: "Hyundai",
          alternatorBrand: "Hyundai",
          upsTopology: null,
          upsBatteryType: null,
          specSheet: [],
          specs: {},
          totalStockCache: 3,
          totalSalesCache: 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockDb.setSelectResult([
          {
            product: mockProduct,
            brand: { id: null, name: null, slug: null },
            category: { id: null, nameVi: null, nameEn: null, slug: null },
          },
        ]);

        const result = await service.findById("dhy65kse");

        expect(result.id).toBe("prod-uuid");
        expect(result.slug).toBe("dhy65kse");
      });
    });

    describe("when product does not exist", () => {
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
            nameVi: "Máy phát điện",
            slug: "dhy65kse",
            price: 245000000,
            images: [],
            productType: "generator",
            frequency: 50,
            specSheet: [],
            specs: {},
            totalStockCache: 1,
            isQuoteOnly: false,
            isActive: true,
          }),
        ).rejects.toThrow(ConflictException);
      });
    });

    describe("when brandId does not exist", () => {
      test("should throw BadRequestException", () => {
        // 1st select: slug check (none)
        // 2nd select: brand check (none)
        mockDb.setSelectResultsQueue([[], []]);

        expect(
          service.create({
            nameVi: "Máy phát điện",
            slug: "dhy65kse",
            brandId: "invalid-brand",
            price: 245000000,
            images: [],
            productType: "generator",
            frequency: 50,
            specSheet: [],
            specs: {},
            totalStockCache: 1,
            isQuoteOnly: false,
            isActive: true,
          }),
        ).rejects.toThrow(BadRequestException);
      });
    });
  });

  describe("delete()", () => {
    describe("when product exists", () => {
      test("should soft delete product by setting deletedAt", async () => {
        mockDb.setSelectResult([{ id: "prod-del" }]);

        await service.delete("prod-del");

        expect(mockDb.update).toHaveBeenCalled();
      });
    });

    describe("when product does not exist", () => {
      test("should throw NotFoundException", () => {
        mockDb.setSelectResult([]);

        expect(service.delete("non-existent")).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });
});
