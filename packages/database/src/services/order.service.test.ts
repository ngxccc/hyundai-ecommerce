/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, test, describe, vi, beforeEach } from "bun:test";
import {
  mockDb,
  mockInsert,
  mockUpdate,
  mockReturning,
  mockFindFirst,
} from "../tests/utils/db-mock";
import { OrderService } from "./order.service";
import type { IDatabase } from "../client";

const orderService = new OrderService(mockDb as unknown as IDatabase);

describe("OrderService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("createOrder() should insert and return order", async () => {
    const mockOrder = { id: "order-1", userId: "user-1", status: "pending" };

    mockReturning.mockResolvedValueOnce([mockOrder]);

    const result = await orderService.createOrder({
      userId: "user-1",
      status: "pending",
    } as any);

    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockOrder as any);
  });

  test("updateOrderStatus() should update and return order", async () => {
    const mockOrder = { id: "order-1", status: "completed" };

    mockReturning.mockResolvedValueOnce([mockOrder]);

    const result = await orderService.updateOrderStatus("order-1", "delivered");

    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockOrder as any);
  });

  test("getComplexOrder() should return nested order", async () => {
    const mockOrder = { id: "order-1", items: [] };

    mockFindFirst.mockResolvedValueOnce(mockOrder);

    const result = await orderService.getComplexOrder("order-1");

    expect(mockFindFirst).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockOrder as any);
  });
});
