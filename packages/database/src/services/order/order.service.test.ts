import { expect, test, describe, vi, beforeEach } from "bun:test";
import {
  mockDb,
  mockInsert,
  mockUpdate,
  mockDelete,
  mockReturning,
  mockFindFirst,
  mockFindMany,
  mockSelectResolvedValue,
} from "../../tests/utils/db-mock";
import { DbOrderService, type ComplexOrder } from "./order.service";
import type { IDatabase } from "../../client";
import type { TOrder } from "../../schemas";
import type { CreateOrderDTO, CreateOrderItemDTO } from "../../dtos";
import { type PostgresError, POSTGRES_ERROR_CODES } from "../../utils";

const orderService = new DbOrderService(mockDb as unknown as IDatabase);

describe("OrderService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("createOrder() should insert and return order", async () => {
    const mockOrder = { id: "order-1", userId: "user-1", status: "PENDING" };

    mockReturning.mockResolvedValueOnce([mockOrder]);

    const result = await orderService.createOrder({
      userId: "user-1",
      status: "PENDING",
    } as unknown as CreateOrderDTO);
    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockOrder as unknown as TOrder);
  });

  test("updateOrderStatus() should update and return order without changing sales cache when status transition is neutral", async () => {
    const mockOrder = { id: "order-1", status: "PENDING", items: [] };

    mockFindFirst.mockResolvedValueOnce(mockOrder);
    mockReturning.mockResolvedValueOnce([mockOrder]);

    const result = await orderService.updateOrderStatus("order-1", "PENDING");

    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockOrder as unknown as TOrder);
  });

  test("updateOrderStatus() should update order and increment sales cache when transition goes from PENDING to PROCESSING", async () => {
    const mockOrder = {
      id: "order-1",
      status: "PENDING",
      items: [{ productId: "prod-1", quantity: 3 }],
    };
    const mockUpdatedOrder = { id: "order-1", status: "PROCESSING" };

    mockFindFirst.mockResolvedValueOnce(mockOrder);
    mockReturning.mockResolvedValueOnce([mockUpdatedOrder]);

    const result = await orderService.updateOrderStatus(
      "order-1",
      "PROCESSING",
    );

    expect(mockUpdate).toHaveBeenCalledTimes(2);
    expect(result).toEqual(mockUpdatedOrder as unknown as TOrder);
  });

  test("getComplexOrder() should return nested order", async () => {
    const mockOrder = { id: "order-1", items: [] };

    mockFindFirst.mockResolvedValueOnce(mockOrder);

    const result = await orderService.getComplexOrder("order-1");

    expect(mockFindFirst).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockOrder as unknown as ComplexOrder);
  });

  test("listOrders() should return list of complex orders with no filters", async () => {
    const mockOrders = [
      { id: "order-1", items: [] },
      { id: "order-2", items: [] },
    ];

    mockFindMany.mockResolvedValueOnce(mockOrders);

    const result = await orderService.listOrders();

    expect(mockFindMany).toHaveBeenCalledTimes(1);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: undefined,
        orderBy: { createdAt: "desc" },
      }),
    );
    expect(result).toEqual(mockOrders as unknown as ComplexOrder[]);
  });

  test("listOrders() should return filtered list of complex orders when status filter is provided", async () => {
    const mockOrders = [{ id: "order-1", status: "PENDING", items: [] }];

    mockFindMany.mockResolvedValueOnce(mockOrders);

    const result = await orderService.listOrders({ status: "PENDING" });

    expect(mockFindMany).toHaveBeenCalledTimes(1);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: { eq: "PENDING" } },
        orderBy: { createdAt: "desc" },
      }),
    );
    expect(result).toEqual(mockOrders as unknown as ComplexOrder[]);
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
      expect(result.updatedOrder).toEqual(mockUpdatedOrder);
      expect(result.selectedBid).toEqual({ id: mockSelectedBid.id });
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
      // 1. Total products
      mockSelectResolvedValue.mockResolvedValueOnce([{ count: 10 }]);
      // 2. Orders metrics (aggregated)
      mockSelectResolvedValue.mockResolvedValueOnce([
        {
          totalOrders: 5,
          totalRevenue: "500000",
          currentRevenue: "300000",
          currentOrders: 3,
          previousRevenue: "200000",
          previousOrders: 2,
        },
      ]);
      // 3. Customers/Users metrics (aggregated)
      mockSelectResolvedValue.mockResolvedValueOnce([
        {
          newCustomers: 4,
          previousCustomers: 2,
        },
      ]);

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

  describe("checkoutWithTradeCredit()", () => {
    test("should throw errors.lockAcquisitionFailed when lock fails", () => {
      const err = new Error("could not obtain lock") as PostgresError;
      err.code = POSTGRES_ERROR_CODES.LOCK_NOT_AVAILABLE;
      mockSelectResolvedValue.mockResolvedValueOnce(Promise.reject(err));

      return expect(
        orderService.checkoutWithTradeCredit(
          "user-1",
          {} as unknown as CreateOrderDTO,
          [],
          "cart-1",
        ),
      ).rejects.toThrow("errors.lockAcquisitionFailed");
    });

    test("should throw errors.insufficientCreditLimit when credit is insufficient", () => {
      const mockUser = {
        id: "user-1",
        role: "DEALER_APPROVER",
        creditLimit: "1000.00",
        currentDebt: "900.00",
      };
      const mockProduct = { id: "prod-1", price: "200.00" }; // recalculated: 200 * 1.1 = 220. available credit: 1000 - 900 = 100.

      mockSelectResolvedValue.mockResolvedValueOnce([mockUser]);
      mockSelectResolvedValue.mockResolvedValueOnce([{ id: "cart-1" }]);
      mockSelectResolvedValue.mockResolvedValueOnce([{ productId: "prod-1", quantity: 1 }]);
      mockSelectResolvedValue.mockResolvedValueOnce([mockProduct]);

      const items = [
        { productId: "prod-1", quantity: 1 } as unknown as CreateOrderItemDTO,
      ];

      return expect(
        orderService.checkoutWithTradeCredit(
          "user-1",
          {} as unknown as CreateOrderDTO,
          items,
          "cart-1",
        ),
      ).rejects.toThrow("errors.insufficientCreditLimit");
    });

    test("should check out successfully and deduct limit for dealer_approver", async () => {
      const mockUser = {
        id: "user-1",
        role: "DEALER_APPROVER",
        creditLimit: "1000.00",
        currentDebt: "500.00",
        name: "Approver",
        email: "app@test.com",
      };
      const mockProduct = { id: "prod-1", price: "200.00" }; // recalculated: 220
      const mockOrder = { id: "order-1", totalAmount: "220.00" };

      mockSelectResolvedValue.mockResolvedValueOnce([mockUser]);
      mockSelectResolvedValue.mockResolvedValueOnce([{ id: "cart-1" }]);
      mockSelectResolvedValue.mockResolvedValueOnce([{ productId: "prod-1", quantity: 1 }]);
      mockSelectResolvedValue.mockResolvedValueOnce([mockProduct]);
      mockReturning.mockResolvedValueOnce([mockOrder]);

      const items = [
        { productId: "prod-1", quantity: 1 } as unknown as CreateOrderItemDTO,
      ];
      const result = await orderService.checkoutWithTradeCredit(
        "user-1",
        {} as unknown as CreateOrderDTO,
        items,
        "cart-1",
      );

      expect(result.id).toBe("order-1");
      expect(mockUpdate).toHaveBeenCalledTimes(1); // Increment currentDebt
      expect(mockInsert).toHaveBeenCalledTimes(3); // Create order, create order items, and insert outbox events
      expect(mockDelete).toHaveBeenCalledTimes(1); // Clear cart
    });

    test("should check out successfully and set pending approval without deducting limit for dealer_purchaser", async () => {
      const mockUser = {
        id: "user-1",
        role: "DEALER_PURCHASER",
        parentId: "user-parent",
        creditLimit: "0.00",
        currentDebt: "0.00",
        name: "Purchaser",
        email: "purch@test.com",
      };
      const mockParent = {
        id: "user-parent",
        role: "DEALER_APPROVER",
        creditLimit: "1000.00",
        currentDebt: "500.00",
      };
      const mockProduct = { id: "prod-1", price: "200.00" }; // recalculated: 220
      const mockOrder = { id: "order-1", totalAmount: "220.00" };

      mockSelectResolvedValue.mockResolvedValueOnce([mockUser]);
      mockSelectResolvedValue.mockResolvedValueOnce([{ id: "cart-1" }]);
      mockSelectResolvedValue.mockResolvedValueOnce([{ productId: "prod-1", quantity: 1 }]);
      mockSelectResolvedValue.mockResolvedValueOnce([mockProduct]);
      mockSelectResolvedValue.mockResolvedValueOnce([mockParent]);
      mockReturning.mockResolvedValueOnce([mockOrder]);

      const items = [
        { productId: "prod-1", quantity: 1 } as unknown as CreateOrderItemDTO,
      ];
      const result = await orderService.checkoutWithTradeCredit(
        "user-1",
        {} as unknown as CreateOrderDTO,
        items,
        "cart-1",
      );

      expect(result.id).toBe("order-1");
      expect(mockUpdate).not.toHaveBeenCalled(); // No currentDebt increment for purchaser at checkout
      expect(mockInsert).toHaveBeenCalledTimes(3); // Create order, create order items, and insert outbox alert
      expect(mockDelete).toHaveBeenCalledTimes(1); // Clear cart
    });
  });

  describe("approveDealerOrder()", () => {
    test("should return undefined if order does not exist", async () => {
      mockSelectResolvedValue.mockResolvedValueOnce([]);
      const result = await orderService.approveDealerOrder("order-1");
      expect(result).toBeUndefined();
    });

    test("should return order directly if already APPROVED", async () => {
      const mockOrder = { id: "order-1", approvalStatus: "APPROVED" };
      mockSelectResolvedValue.mockResolvedValueOnce([mockOrder]);
      const result = await orderService.approveDealerOrder("order-1");
      expect(result).toEqual({ id: mockOrder.id });
    });

    test("should throw errors.insufficientCreditLimit if available credit is insufficient for TRADE_CREDIT order", () => {
      const mockOrder = {
        id: "order-1",
        approvalStatus: "PENDING_APPROVAL",
        paymentMethod: "TRADE_CREDIT",
        totalAmount: "220.00",
        userId: "user-1",
      };
      const mockUser = {
        id: "user-1",
        creditLimit: "100.00",
        currentDebt: "50.00",
      };
      const mockItems = [{ productId: "prod-1", quantity: 1, unitPrice: "200.00" }];

      mockSelectResolvedValue.mockResolvedValueOnce([mockOrder]);
      mockSelectResolvedValue.mockResolvedValueOnce(mockItems);
      mockSelectResolvedValue.mockResolvedValueOnce([{ parentId: null }]);
      mockSelectResolvedValue.mockResolvedValueOnce([mockUser]);

      expect(orderService.approveDealerOrder("order-1")).rejects.toThrow(
        "errors.insufficientCreditLimit",
      );
    });

    test("should approve successfully and increment currentDebt for TRADE_CREDIT order if limit is sufficient", async () => {
      const mockOrder = {
        id: "order-1",
        approvalStatus: "PENDING_APPROVAL",
        paymentMethod: "TRADE_CREDIT",
        totalAmount: "220.00",
        userId: "user-1",
      };
      const mockUser = {
        id: "user-1",
        creditLimit: "500.00",
        currentDebt: "50.00",
      };
      const mockItems = [{ productId: "prod-1", quantity: 1, unitPrice: "200.00" }];
      const approvedOrder = { ...mockOrder, approvalStatus: "APPROVED" };

      mockSelectResolvedValue.mockResolvedValueOnce([mockOrder]);
      mockSelectResolvedValue.mockResolvedValueOnce(mockItems);
      mockSelectResolvedValue.mockResolvedValueOnce([{ parentId: null }]);
      mockSelectResolvedValue.mockResolvedValueOnce([mockUser]);
      mockReturning.mockResolvedValueOnce([{ id: approvedOrder.id }]);

      const result = await orderService.approveDealerOrder("order-1");
      expect(result).toEqual({ id: approvedOrder.id });
      expect(mockUpdate).toHaveBeenCalledTimes(2);
    });

    test("should approve purchaser order and update parent company debt when purchaser has parentId", async () => {
      const mockOrder = {
        id: "order-1",
        approvalStatus: "PENDING_APPROVAL",
        paymentMethod: "TRADE_CREDIT",
        totalAmount: "220.00",
        userId: "user-employee",
      };
      const mockParent = {
        id: "user-parent",
        creditLimit: "500.00",
        currentDebt: "50.00",
      };
      const mockItems = [{ productId: "prod-1", quantity: 1, unitPrice: "200.00" }];
      const approvedOrder = { ...mockOrder, approvalStatus: "APPROVED" };

      mockSelectResolvedValue.mockResolvedValueOnce([mockOrder]);
      mockSelectResolvedValue.mockResolvedValueOnce(mockItems);
      mockSelectResolvedValue.mockResolvedValueOnce([{ parentId: "user-parent" }]);
      mockSelectResolvedValue.mockResolvedValueOnce([mockParent]);
      mockReturning.mockResolvedValueOnce([{ id: approvedOrder.id }]);

      const result = await orderService.approveDealerOrder("order-1");
      expect(result).toEqual({ id: approvedOrder.id });
      expect(mockUpdate).toHaveBeenCalledTimes(2); // updates order status AND updates parent currentDebt
    });
  });
  describe("expirePendingOrders()", () => {
    test("should expire pending unpaid orders older than the threshold", async () => {
      const mockExpiredOrders = [{ id: "order-1" }];
      mockSelectResolvedValue.mockResolvedValueOnce(mockExpiredOrders);

      const result = await orderService.expirePendingOrders(15);

      expect(result).toEqual({ expiredCount: 1 });
      expect(mockUpdate).toHaveBeenCalledTimes(3);
    });

    test("should return 0 expired orders if no orders are found", async () => {
      mockSelectResolvedValue.mockResolvedValueOnce([]);

      const result = await orderService.expirePendingOrders(15);

      expect(result).toEqual({ expiredCount: 0 });
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });
});
