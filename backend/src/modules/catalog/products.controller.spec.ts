import { beforeEach, describe, expect, test, mock } from "bun:test";
import { ProductsController } from "./products.controller";
import type { ProductsService } from "./products.service";
import type { ProductResponseDto } from "./dto/product-response.dto";
import type { CreateProductDto } from "./dto/create-product.dto";
import type { UpdateProductDto } from "./dto/update-product.dto";
import type { ProductMetadataResponseDto } from "./dto/product-metadata-response.dto";

describe("ProductsController", () => {
  let controller: ProductsController;

  const mockProduct: ProductResponseDto = {
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
    brandId: null,
    categoryId: null,
    productType: "generator",
    powerKva: "60.00",
    powerKw: "48.00",
    standbyPowerKva: null,
    standbyPowerKw: null,
    phase: "3phase",
    voltage: "230/400V",
    frequency: 50,
    fuelType: "diesel",
    canopyType: "silent",
    startMethod: "electric",
    engineBrand: "Hyundai",
    alternatorBrand: "Hyundai",
    upsTopology: null,
    upsBatteryType: null,
    specSheet: [],
    specs: {},
    totalStockCache: 5,
    totalSalesCache: 0,
    isActive: true,
    createdAt: new Date("2026-09-04T08:00:00.000Z"),
    updatedAt: new Date("2026-09-04T08:00:00.000Z"),
  };

  const mockMetadata: ProductMetadataResponseDto = {
    brands: [{ id: "brand-1", name: "Hyundai Power", count: 10 }],
    categories: [
      { id: "cat-1", nameVi: "Máy phát điện", nameEn: "Generators", count: 12 },
    ],
    powerRange: { min: 10, max: 2500 },
    priceRange: { min: 10000000, max: 5000000000 },
    fuelTypes: [{ value: "diesel", count: 15 }],
    phases: [{ value: "3phase", count: 12 }],
    canopyTypes: [{ value: "silent", count: 10 }],
  };

  const mockProductsService = {
    findProducts: mock(() =>
      Promise.resolve({
        items: [mockProduct],
        meta: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      }),
    ),
    getMetadata: mock(() => Promise.resolve(mockMetadata)),
    findById: mock((_id: string) => Promise.resolve(mockProduct)),
    create: mock((_dto: CreateProductDto) => Promise.resolve(mockProduct)),
    update: mock((_id: string, _dto: UpdateProductDto) =>
      Promise.resolve(mockProduct),
    ),
    delete: mock((_id: string) => Promise.resolve()),
    clearAll() {
      this.findProducts.mockClear();
      this.getMetadata.mockClear();
      this.findById.mockClear();
      this.create.mockClear();
      this.update.mockClear();
      this.delete.mockClear();
    },
  };

  beforeEach(() => {
    mockProductsService.clearAll();
    controller = new ProductsController(
      mockProductsService as unknown as ProductsService,
    );
  });

  describe("GET /products", () => {
    describe("when client queries paginated products", () => {
      test("should return wrapped items and pagination metadata", async () => {
        const result = await controller.getProducts({
          page: 1,
          limit: 20,
          sort: "newest",
        });

        expect(mockProductsService.findProducts).toHaveBeenCalled();
        expect(result.success).toBe(true);
        expect(result.data.length).toBe(1);
        expect(result.meta?.total).toBe(1);
      });
    });
  });

  describe("GET /products/metadata", () => {
    describe("when client queries faceted filter metadata", () => {
      test("should return wrapped filter ranges and facet counts", async () => {
        const result = await controller.getMetadata();

        expect(mockProductsService.getMetadata).toHaveBeenCalled();
        expect(result.success).toBe(true);
        expect(result.data.powerRange.min).toBe(10);
      });
    });
  });

  describe("GET /products/:id", () => {
    describe("when client queries product by ID", () => {
      test("should return wrapped product details", async () => {
        const result = await controller.getById("prod-1");

        expect(mockProductsService.findById).toHaveBeenCalledWith("prod-1");
        expect(result.data.id).toBe("prod-1");
      });
    });
  });

  describe("POST /products", () => {
    describe("when admin creates product", () => {
      test("should return wrapped created product", async () => {
        const dto: CreateProductDto = {
          nameVi: "Máy phát điện Hyundai",
          slug: "may-phat-dien-hyundai",
          price: 245000000,
          images: [],
          productType: "generator",
          frequency: 50,
          specSheet: [],
          specs: {},
          totalStockCache: 1,
          isActive: true,
        };

        const result = await controller.create(dto);

        expect(mockProductsService.create).toHaveBeenCalledWith(dto);
        expect(result.data.price).toBe("245000000.00");
      });
    });
  });

  describe("PUT /products/:id", () => {
    describe("when admin updates product", () => {
      test("should return wrapped updated product", async () => {
        const dto: UpdateProductDto = { price: 250000000 };

        const result = await controller.update("prod-1", dto);

        expect(mockProductsService.update).toHaveBeenCalledWith("prod-1", dto);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("DELETE /products/:id", () => {
    describe("when admin deletes product", () => {
      test("should return wrapped success response with null data", async () => {
        const result = await controller.delete("prod-1");

        expect(mockProductsService.delete).toHaveBeenCalledWith("prod-1");
        expect(result.success).toBe(true);
        expect(result.data).toBeNull();
      });
    });
  });
});
