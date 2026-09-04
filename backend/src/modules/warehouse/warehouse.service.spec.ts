import { beforeEach, describe, expect, test } from "bun:test";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { WarehouseService } from "./warehouse.service";
import type { DrizzleDB } from "@/database/database.module";
import { createMockDb } from "../../../test/mocks";

describe("WarehouseService", () => {
  let service: WarehouseService;
  const mockDb = createMockDb();

  beforeEach(() => {
    mockDb.clearAll();
    service = new WarehouseService(mockDb as unknown as DrizzleDB);
  });

  describe("findAll()", () => {
    describe("when warehouses exist", () => {
      test("should return list of warehouses ordered by city and name", async () => {
        const mockWarehouse = {
          id: "wh-1",
          nameVi: "Kho Tổng Hà Nội",
          nameEn: "Hanoi Main Warehouse",
          streetAddress: "386 Nguyễn Văn Linh",
          district: "Long Biên",
          city: "Hà Nội",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockDb.setSelectResult([mockWarehouse]);

        const result = await service.findAll();

        expect(result.length).toBe(1);
        expect(result[0]?.nameVi).toBe("Kho Tổng Hà Nội");
        expect(result[0]?.city).toBe("Hà Nội");
      });
    });
  });

  describe("findById()", () => {
    describe("when warehouse exists", () => {
      test("should return warehouse details matching ID", async () => {
        const mockWarehouse = {
          id: "wh-1",
          nameVi: "Kho Đà Nẵng",
          nameEn: "Danang Warehouse",
          streetAddress: "KCN Hòa Khánh",
          district: "Liên Chiểu",
          city: "Đà Nẵng",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockDb.setSelectResult([mockWarehouse]);

        const result = await service.findById("wh-1");

        expect(result.id).toBe("wh-1");
        expect(result.nameVi).toBe("Kho Đà Nẵng");
      });
    });

    describe("when warehouse does not exist", () => {
      test("should throw NotFoundException", () => {
        mockDb.setSelectResult([]);

        expect(service.findById("non-existent")).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });

  describe("create()", () => {
    describe("when valid payload provided", () => {
      test("should insert and return created warehouse", async () => {
        const newWarehouse = {
          id: "wh-new",
          nameVi: "Kho Tổng Bình Dương",
          nameEn: null,
          streetAddress: "KCN VSIP 1",
          district: "Thuận An",
          city: "Bình Dương",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockDb.setSelectResult([newWarehouse]);

        const result = await service.create({
          nameVi: "Kho Tổng Bình Dương",
          streetAddress: "KCN VSIP 1",
          district: "Thuận An",
          city: "Bình Dương",
          isActive: true,
        });

        expect(result.id).toBe("wh-new");
        expect(result.nameVi).toBe("Kho Tổng Bình Dương");
      });
    });
  });

  describe("update()", () => {
    describe("when warehouse exists", () => {
      test("should update warehouse and return updated record", async () => {
        const existingWarehouse = {
          id: "wh-1",
          nameVi: "Kho Cũ",
          nameEn: null,
          streetAddress: "Địa chỉ cũ",
          district: "Quận cũ",
          city: "TP cũ",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const updatedWarehouse = {
          ...existingWarehouse,
          nameVi: "Kho Mới Cập Nhật",
        };

        // 1st select: findById
        // 2nd returning: update
        mockDb.setSelectResultsQueue([[existingWarehouse], [updatedWarehouse]]);

        const result = await service.update("wh-1", {
          nameVi: "Kho Mới Cập Nhật",
        });

        expect(result.nameVi).toBe("Kho Mới Cập Nhật");
      });
    });

    describe("when warehouse does not exist", () => {
      test("should throw NotFoundException", () => {
        mockDb.setSelectResult([]);

        expect(
          service.update("non-existent", { nameVi: "Mới" }),
        ).rejects.toThrow(NotFoundException);
      });
    });
  });

  describe("delete()", () => {
    describe("when warehouse exists", () => {
      test("should deactivate warehouse by setting isActive to false", async () => {
        const existingWarehouse = {
          id: "wh-1",
          nameVi: "Kho Hà Nội",
          nameEn: null,
          streetAddress: "386 Nguyễn Văn Linh",
          district: "Long Biên",
          city: "Hà Nội",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockDb.setSelectResult([existingWarehouse]);

        await service.delete("wh-1");

        expect(mockDb.update).toHaveBeenCalled();
      });
    });

    describe("when warehouse does not exist", () => {
      test("should throw NotFoundException", () => {
        mockDb.setSelectResult([]);

        expect(service.delete("non-existent")).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });

  describe("updateStock()", () => {
    describe("when warehouse is inactive", () => {
      test("should throw BadRequestException", () => {
        const inactiveWarehouse = {
          id: "wh-inactive",
          nameVi: "Kho Đóng Cửa",
          nameEn: null,
          streetAddress: "Địa chỉ",
          district: "Quận",
          city: "Hà Nội",
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockDb.setSelectResult([inactiveWarehouse]);

        expect(
          service.updateStock("wh-inactive", {
            productId: "019fa8bc-8f4d-7000-b366-e691f45cfb8f",
            stock: 5,
            minStockWarning: 2,
          }),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe("when product does not exist", () => {
      test("should throw NotFoundException", () => {
        const activeWarehouse = {
          id: "wh-active",
          nameVi: "Kho Hoạt Động",
          nameEn: null,
          streetAddress: "Địa chỉ",
          district: "Quận",
          city: "Hà Nội",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // 1st select: warehouse exists
        // 2nd select: product not found
        mockDb.setSelectResultsQueue([[activeWarehouse], []]);

        expect(
          service.updateStock("wh-active", {
            productId: "non-existent-product",
            stock: 10,
            minStockWarning: 2,
          }),
        ).rejects.toThrow(NotFoundException);
      });
    });
  });
});
