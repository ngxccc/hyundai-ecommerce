/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, test, describe, vi, beforeEach } from "bun:test";
import {
  mockDb,
  mockInsert,
  mockUpdate,
  mockReturning,
  mockFindFirst,
  mockFindMany,
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

  test("list() should return list of complex orders with no filters", async () => {
    const mockOrders = [
      { id: "order-1", items: [] },
      { id: "order-2", items: [] },
    ];

    mockFindMany.mockResolvedValueOnce(mockOrders);

    const result = await orderService.list();

    expect(mockFindMany).toHaveBeenCalledTimes(1);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: undefined,
        orderBy: { createdAt: "desc" },
      }),
    );
    expect(result).toEqual(mockOrders as any);
  });

  test("list() should return filtered list of complex orders when status filter is provided", async () => {
    const mockOrders = [{ id: "order-1", status: "pending", items: [] }];

    mockFindMany.mockResolvedValueOnce(mockOrders);

    const result = await orderService.list({ status: "pending" });

    expect(mockFindMany).toHaveBeenCalledTimes(1);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: { eq: "pending" } },
        orderBy: { createdAt: "desc" },
      }),
    );
    expect(result).toEqual(mockOrders as any);
  });
  test("list() should return filtered list of complex orders when status filter is provided", async () => {
    const mockOrders = [{ id: "order-1", status: "pending", items: [] }];
    mockFindMany.mockResolvedValueOnce(mockOrders);
    const result = await orderService.list({ status: "pending" });
    expect(mockFindMany).toHaveBeenCalledTimes(1);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: { eq: "pending" } },
        orderBy: { createdAt: "desc" },
      }),
    );
    expect(result).toEqual(mockOrders as any);
  });
  describe("selectWinningBid()", () => {
    test("should select the winning bid, deselect others, and update order shippingFee", async () => {
      const mockSelectedBid = {
        id: "bid-1",
        orderId: "order-1",
        quotedPrice: "150000",
        isSelected: true,
      };
      const mockUpdatedOrder = { id: "order-1", shippingFee: "150000" };
      // First update (select winner)
      mockReturning.mockResolvedValueOnce([mockSelectedBid]);
      // Second update (order)
      mockReturning.mockResolvedValueOnce([mockUpdatedOrder]);
      const result = await orderService.selectWinningBid("order-1", "bid-1");
      expect(mockUpdate).toHaveBeenCalledTimes(3);
      expect(result.updatedOrder).toEqual(mockUpdatedOrder as any);
      expect(result.selectedBid).toEqual(mockSelectedBid as any);
    });
    test("should throw when bid does not belong to the order", () => {
      mockReturning.mockResolvedValueOnce([]); // select fails
      expect(
        orderService.selectWinningBid("order-1", "bid-not-exist"),
      ).rejects.toThrow("errors.shippingBidNotFound");
    });
  });
});
