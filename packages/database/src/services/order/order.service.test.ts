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
  mockSelectResolvedValue,
} from "../../tests/utils/db-mock";
import { OrderService } from "./order.service";
import type { IDatabase } from "../../client";
import type { TOrder, TNewOrder } from "../../schemas";

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
    } as unknown as TNewOrder);
    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockOrder as unknown as TOrder);
  });

  test("updateOrderStatus() should update and return order without changing sales cache when status transition is neutral", async () => {
    const mockOrder = { id: "order-1", status: "pending", items: [] };

    mockFindFirst.mockResolvedValueOnce(mockOrder);
    mockReturning.mockResolvedValueOnce([mockOrder]);

    const result = await orderService.updateOrderStatus("order-1", "pending");

    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockOrder as unknown as TOrder);
  });

  test("updateOrderStatus() should update order and increment sales cache when transition goes from pending to processing", async () => {
    const mockOrder = {
      id: "order-1",
      status: "pending",
      items: [{ productId: "prod-1", quantity: 3 }],
    };
    const mockUpdatedOrder = { id: "order-1", status: "processing" };

    mockFindFirst.mockResolvedValueOnce(mockOrder);
    mockReturning.mockResolvedValueOnce([mockUpdatedOrder]);

    const result = await orderService.updateOrderStatus(
      "order-1",
      "processing",
    );

    expect(mockUpdate).toHaveBeenCalledTimes(2);
    expect(result).toEqual(mockUpdatedOrder as unknown as TOrder);
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
  describe("getDashboardMetrics()", () => {
    test("should return aggregated metrics with correct growth calculations", async () => {
      mockSelectResolvedValue.mockResolvedValueOnce([{ count: 10 }]);
      mockSelectResolvedValue.mockResolvedValueOnce([{ count: 5 }]);
      mockSelectResolvedValue.mockResolvedValueOnce([{ sum: "500000" }]);
      mockSelectResolvedValue.mockResolvedValueOnce([
        { sum: "300000", count: 3 },
      ]);
      mockSelectResolvedValue.mockResolvedValueOnce([
        { sum: "200000", count: 2 },
      ]);
      mockSelectResolvedValue.mockResolvedValueOnce([{ count: 4 }]);
      mockSelectResolvedValue.mockResolvedValueOnce([{ count: 2 }]);

      const result = await orderService.getDashboardMetrics();

      expect(result).toEqual({
        totalRevenue: "500000",
        totalOrders: 5,
        totalProducts: 10,
        newCustomers: 4,
        revenueGrowth: 50,
        ordersGrowth: 50,
        customersGrowth: 100,
      });
    });
  });

  describe("getMonthlyRevenue()", () => {
    test("should return mapped 12 months data", async () => {
      const queryResult = [
        { month: "01", revenue: "150000", orderCount: 2 },
        { month: "02", revenue: "200000", orderCount: 3 },
      ];
      mockSelectResolvedValue.mockResolvedValueOnce(queryResult);

      const result = await orderService.getMonthlyRevenue(2026);

      expect(result).toHaveLength(12);
      expect(result[0]).toEqual({
        month: "01",
        revenue: "150000",
        orderCount: 2,
      });
      expect(result[1]).toEqual({
        month: "02",
        revenue: "200000",
        orderCount: 3,
      });
      expect(result[2]).toEqual({ month: "03", revenue: "0", orderCount: 0 });
    });
  });
});
