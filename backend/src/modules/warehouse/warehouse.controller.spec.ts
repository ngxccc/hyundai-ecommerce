import { beforeEach, describe, expect, test, mock } from "bun:test";
import { WarehouseController } from "./warehouse.controller";
import type { WarehouseService } from "./warehouse.service";
import type { WarehouseResponseDto } from "./dto/warehouse-response.dto";
import type { WarehouseStockResponseDto } from "./dto/warehouse-stock-response.dto";
import type { CreateWarehouseDto } from "./dto/create-warehouse.dto";
import type { UpdateWarehouseDto } from "./dto/update-warehouse.dto";
import type { UpdateStockDto } from "./dto/update-stock.dto";

describe("WarehouseController", () => {
  let controller: WarehouseController;

  const mockWarehouse: WarehouseResponseDto = {
    id: "wh-1",
    nameVi: "Kho Tổng Hà Nội",
    nameEn: "Hanoi Central Warehouse",
    streetAddress: "386 Nguyễn Văn Linh",
    district: "Long Biên",
    city: "Hà Nội",
    isActive: true,
    createdAt: new Date("2026-09-04T08:00:00.000Z"),
    updatedAt: new Date("2026-09-04T08:00:00.000Z"),
  };

  const mockStock: WarehouseStockResponseDto = {
    warehouseId: "wh-1",
    productId: "prod-1",
    stock: 10,
    minStockWarning: 2,
    createdAt: new Date("2026-09-04T08:00:00.000Z"),
    updatedAt: new Date("2026-09-04T08:00:00.000Z"),
    product: {
      id: "prod-1",
      nameVi: "Máy phát điện",
      slug: "may-phat-dien",
      totalStockCache: 25,
    },
    warehouse: {
      id: "wh-1",
      nameVi: "Kho Tổng Hà Nội",
      city: "Hà Nội",
    },
  };

  const mockWarehouseService = {
    findAll: mock(() => Promise.resolve([mockWarehouse])),
    findById: mock((_id: string) => Promise.resolve(mockWarehouse)),
    create: mock((_dto: CreateWarehouseDto) => Promise.resolve(mockWarehouse)),
    update: mock((_id: string, _dto: UpdateWarehouseDto) =>
      Promise.resolve(mockWarehouse),
    ),
    delete: mock((_id: string) => Promise.resolve()),
    getWarehouseStocks: mock((_id: string) => Promise.resolve([mockStock])),
    getProductStocks: mock((_id: string) => Promise.resolve([mockStock])),
    updateStock: mock((_id: string, _dto: UpdateStockDto) =>
      Promise.resolve(mockStock),
    ),
    clearAll() {
      this.findAll.mockClear();
      this.findById.mockClear();
      this.create.mockClear();
      this.update.mockClear();
      this.delete.mockClear();
      this.getWarehouseStocks.mockClear();
      this.getProductStocks.mockClear();
      this.updateStock.mockClear();
    },
  };

  beforeEach(() => {
    mockWarehouseService.clearAll();
    controller = new WarehouseController(
      mockWarehouseService as unknown as WarehouseService,
    );
  });

  describe("GET /warehouses", () => {
    describe("when client queries all warehouses", () => {
      test("should return wrapped list of warehouses", async () => {
        const result = await controller.getAll();

        expect(mockWarehouseService.findAll).toHaveBeenCalledWith(false);
        expect(result.success).toBe(true);
        expect(result.data.length).toBe(1);
      });
    });
  });

  describe("GET /warehouses/:id", () => {
    describe("when client queries warehouse by ID", () => {
      test("should return wrapped warehouse details", async () => {
        const result = await controller.getById("wh-1");

        expect(mockWarehouseService.findById).toHaveBeenCalledWith("wh-1");
        expect(result.data.id).toBe("wh-1");
      });
    });
  });

  describe("POST /warehouses", () => {
    describe("when admin creates warehouse", () => {
      test("should return wrapped created warehouse", async () => {
        const dto: CreateWarehouseDto = {
          nameVi: "Kho Tổng Hà Nội",
          streetAddress: "386 Nguyễn Văn Linh",
          district: "Long Biên",
          city: "Hà Nội",
          isActive: true,
        };

        const result = await controller.create(dto);

        expect(mockWarehouseService.create).toHaveBeenCalledWith(dto);
        expect(result.data.nameVi).toBe("Kho Tổng Hà Nội");
      });
    });
  });

  describe("PUT /warehouses/:id/stock", () => {
    describe("when admin updates product stock in warehouse", () => {
      test("should return wrapped stock response with synchronized totalStockCache", async () => {
        const dto: UpdateStockDto = {
          productId: "prod-1",
          stock: 10,
          minStockWarning: 2,
        };

        const result = await controller.updateStock("wh-1", dto);

        expect(mockWarehouseService.updateStock).toHaveBeenCalledWith(
          "wh-1",
          dto,
        );
        expect(result.data.stock).toBe(10);
        expect(result.data.product?.totalStockCache).toBe(25);
      });
    });
  });

  describe("DELETE /warehouses/:id", () => {
    describe("when admin deactivates warehouse", () => {
      test("should return wrapped success response with null data", async () => {
        const result = await controller.delete("wh-1");

        expect(mockWarehouseService.delete).toHaveBeenCalledWith("wh-1");
        expect(result.success).toBe(true);
        expect(result.data).toBeNull();
      });
    });
  });
});
