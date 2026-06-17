import { expect, test, describe, vi, beforeEach } from "bun:test";
import {
  mockDb,
  mockFindMany,
  mockInsert,
  mockUpdate,
  mockReturning,
  mockWhere,
  mockLimit,
} from "../../tests/utils/db-mock";
import { type WarehouseDTO } from "../../dtos";
import { DbWarehouseService } from "./warehouse.service";
import type { IDatabase } from "../../client";

const warehouseService = new DbWarehouseService(mockDb as unknown as IDatabase);

describe("WarehouseService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("getAll() should return a list of warehouses", async () => {
    const mockWarehouses = [
      {
        id: "1",
        nameVi: "Main Warehouse",
        nameEn: null,
        streetAddress: "123 Main St",
        district: "District 1",
        city: "HCM City",
        isActive: true,
      },
    ] as WarehouseDTO[];

    mockFindMany.mockResolvedValueOnce(mockWarehouses);

    const result = await warehouseService.getAll();

    expect(mockFindMany).toHaveBeenCalledTimes(1);
    expect(mockFindMany).toHaveBeenCalledWith({
      columns: {
        id: true,
        nameVi: true,
        nameEn: true,
        streetAddress: true,
        district: true,
        city: true,
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    expect(result).toEqual(mockWarehouses);
  });

  test("create() should insert and return new warehouse", async () => {
    const mockWarehouseDto = {
      id: "1",
      nameVi: "Main Warehouse",
      nameEn: null,
      streetAddress: "123 Main St",
      district: "District 1",
      city: "HCM City",
      isActive: true,
    } as WarehouseDTO;
    mockReturning.mockResolvedValueOnce([mockWarehouseDto]);

    const result = await warehouseService.create({
      nameVi: "Main Warehouse",
      nameEn: null,
      streetAddress: "123 Main St",
      district: "District 1",
      city: "HCM City",
      isActive: true,
    });

    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockReturning).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockWarehouseDto);
  });

  test("update() should update and return warehouse", async () => {
    const mockWarehouseDto = {
      id: "1",
      nameVi: "Updated Warehouse",
      nameEn: null,
      streetAddress: "123 Main St",
      district: "District 1",
      city: "HCM City",
      isActive: true,
    } as WarehouseDTO;
    mockReturning.mockResolvedValueOnce([mockWarehouseDto]);

    const result = await warehouseService.update({
      id: "1",
      nameVi: "Updated Warehouse",
    });

    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockWhere).toHaveBeenCalledTimes(1);
    expect(mockReturning).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockWarehouseDto);
  });

  test("getById() should return warehouse when found", async () => {
    const mockWarehouseDto = {
      id: "1",
      nameVi: "Main Warehouse",
      nameEn: null,
      streetAddress: "123 Main St",
      district: "District 1",
      city: "HCM City",
      isActive: true,
    } as WarehouseDTO;
    mockLimit.mockResolvedValueOnce([mockWarehouseDto]);

    const result = await warehouseService.getById("1");

    expect(mockLimit).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockWarehouseDto);
  });

  test("delete() should soft-delete warehouse", async () => {
    mockWhere.mockResolvedValueOnce([]);

    const result = await warehouseService.delete("1");

    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockWhere).toHaveBeenCalledTimes(1);
    expect(result).toEqual(true);
  });
});
