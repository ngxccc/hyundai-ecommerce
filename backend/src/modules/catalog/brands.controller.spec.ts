import { beforeEach, describe, expect, test, mock } from "bun:test";
import { BrandsController } from "./brands.controller";
import type { BrandsService } from "./brands.service";
import type { BrandResponseDto } from "./dto/brand-response.dto";
import type { CreateBrandDto } from "./dto/create-brand.dto";
import type { UpdateBrandDto } from "./dto/update-brand.dto";

describe("BrandsController", () => {
  let controller: BrandsController;

  const mockBrand: BrandResponseDto = {
    id: "brand-1",
    name: "Hyundai Power",
    slug: "hyundai-power",
    logo: null,
    descriptionVi: null,
    descriptionEn: null,
    isActive: true,
    createdAt: new Date("2026-09-04T08:00:00.000Z"),
    updatedAt: new Date("2026-09-04T08:00:00.000Z"),
  };

  const mockBrandsService = {
    findAll: mock(() => Promise.resolve([mockBrand])),
    findById: mock((_id: string) => Promise.resolve(mockBrand)),
    create: mock((_dto: CreateBrandDto) => Promise.resolve(mockBrand)),
    update: mock((_id: string, _dto: UpdateBrandDto) =>
      Promise.resolve(mockBrand),
    ),
    delete: mock((_id: string) => Promise.resolve()),
    clearAll() {
      this.findAll.mockClear();
      this.findById.mockClear();
      this.create.mockClear();
      this.update.mockClear();
      this.delete.mockClear();
    },
  };

  beforeEach(() => {
    mockBrandsService.clearAll();
    controller = new BrandsController(
      mockBrandsService as unknown as BrandsService,
    );
  });

  describe("GET /brands", () => {
    describe("when client queries all brands", () => {
      test("should return wrapped list of brands", async () => {
        const result = await controller.getAll();

        expect(mockBrandsService.findAll).toHaveBeenCalled();
        expect(result.success).toBe(true);
        expect(result.data.length).toBe(1);
      });
    });
  });

  describe("GET /brands/:id", () => {
    describe("when client queries brand by id", () => {
      test("should return wrapped brand details", async () => {
        const result = await controller.getById("brand-1");

        expect(mockBrandsService.findById).toHaveBeenCalledWith("brand-1");
        expect(result.data.id).toBe("brand-1");
      });
    });
  });

  describe("POST /brands", () => {
    describe("when admin creates brand", () => {
      test("should return wrapped created brand", async () => {
        const dto: CreateBrandDto = {
          name: "Hyundai Power",
          slug: "hyundai-power",
          isActive: true,
        };

        const result = await controller.create(dto);

        expect(mockBrandsService.create).toHaveBeenCalledWith(dto);
        expect(result.data.name).toBe("Hyundai Power");
      });
    });
  });

  describe("PUT /brands/:id", () => {
    describe("when admin updates brand", () => {
      test("should return wrapped updated brand", async () => {
        const dto: UpdateBrandDto = { name: "Hyundai Power Asia" };

        const result = await controller.update("brand-1", dto);

        expect(mockBrandsService.update).toHaveBeenCalledWith("brand-1", dto);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("DELETE /brands/:id", () => {
    describe("when admin deletes brand", () => {
      test("should return wrapped success response with null data", async () => {
        const result = await controller.delete("brand-1");

        expect(mockBrandsService.delete).toHaveBeenCalledWith("brand-1");
        expect(result.success).toBe(true);
        expect(result.data).toBeNull();
      });
    });
  });
});
