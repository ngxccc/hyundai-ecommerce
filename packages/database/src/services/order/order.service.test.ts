/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { DbOrderService } from "./order.service";
import type { IDatabase } from "../../client";
import type { TOrder } from "../../schemas";
import type { CreateOrderDTO } from "../../dtos";
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
    const mockOrders = [{ id: "order-1", status: "PENDING", items: [] }];

    mockFindMany.mockResolvedValueOnce(mockOrders);

    const result = await orderService.list({ status: "PENDING" });

    expect(mockFindMany).toHaveBeenCalledTimes(1);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: { eq: "PENDING" } },
        orderBy: { createdAt: "desc" },
      }),
    );
    expect(result).toEqual(mockOrders as any);
  });
  test("list() should return filtered list of complex orders when status filter is provided", async () => {
    const mockOrders = [{ id: "order-1", status: "PENDING", items: [] }];
    mockFindMany.mockResolvedValueOnce(mockOrders);
    const result = await orderService.list({ status: "PENDING" });
    expect(mockFindMany).toHaveBeenCalledTimes(1);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: { eq: "PENDING" } },
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

  describe("confirmPayOSPayment()", () => {
    test("should return false if payment does not exist", async () => {
      mockSelectResolvedValue.mockResolvedValueOnce([]); // payment not found

      const result = await orderService.confirmPayOSPayment(
        "tx-1",
        1000,
        "ref-1",
      );
      expect(result).toBe(false);
    });

    test("should return false if payment status is already COMPLETED", async () => {
      mockSelectResolvedValue.mockResolvedValueOnce([{ status: "COMPLETED" }]);

      const result = await orderService.confirmPayOSPayment(
        "tx-1",
        1000,
        "ref-1",
      );
      expect(result).toBe(false);
    });

    test("should handle amount mismatch by placing order on SUSPICIOUS_PAYMENT_HOLD and logging failure", async () => {
      const mockPayment = {
        id: "pay-1",
        orderId: "order-1",
        amount: "1000.00",
        status: "PENDING",
      };
      const mockOrder = {
        id: "order-1",
        totalAmount: "1000.00",
        userId: "user-1",
      };

      mockSelectResolvedValue.mockResolvedValueOnce([mockPayment]);
      mockSelectResolvedValue.mockResolvedValueOnce([mockOrder]);

      const result = await orderService.confirmPayOSPayment(
        "tx-1",
        500,
        "ref-1",
      ); // 500 !== 1000

      expect(result).toBe(true);
      expect(mockUpdate).toHaveBeenCalledTimes(1); // Set order status to SUSPICIOUS_PAYMENT_HOLD
      expect(mockInsert).toHaveBeenCalledTimes(2); // Log transaction failure & Send Telegram alert
    });

    test("should process payment successfully when amounts match", async () => {
      const mockPayment = {
        id: "pay-1",
        orderId: "order-1",
        amount: "1000.00",
        status: "PENDING",
      };
      const mockOrder = {
        id: "order-1",
        totalAmount: "1000.00",
        userId: "user-1",
      };
      const mockCustomer = { id: "user-1", email: "customer@test.com" };

      mockSelectResolvedValue.mockResolvedValueOnce([mockPayment]);
      mockSelectResolvedValue.mockResolvedValueOnce([mockOrder]);
      mockSelectResolvedValue.mockResolvedValueOnce([mockCustomer]);

      const result = await orderService.confirmPayOSPayment(
        "tx-1",
        1000,
        "ref-1",
      ); // 1000 === 1000

      expect(result).toBe(true);
      expect(mockUpdate).toHaveBeenCalledTimes(2); // Update payment (COMPLETED) & Update order paymentStatus (FULLY_PAID)
      expect(mockInsert).toHaveBeenCalledTimes(2); // Log transaction success & Send outbox events (SEND_MAIL & SEND_TELEGRAM_ALERT)
    });

    test("should process REMAINDER payment successfully when order paymentStatus is DEPOSIT_PAID", async () => {
      const mockPayment = {
        id: "pay-1",
        orderId: "order-1",
        amount: "800.00",
        status: "PENDING",
      };
      const mockOrder = {
        id: "order-1",
        totalAmount: "1000.00",
        userId: "user-1",
        paymentStatus: "DEPOSIT_PAID",
      };
      const mockCustomer = { id: "user-1", email: "customer@test.com" };

      mockSelectResolvedValue.mockResolvedValueOnce([mockPayment]);
      mockSelectResolvedValue.mockResolvedValueOnce([mockOrder]);
      mockSelectResolvedValue.mockResolvedValueOnce([mockCustomer]);

      const result = await orderService.confirmPayOSPayment(
        "tx-1",
        800,
        "ref-1",
      );

      expect(result).toBe(true);
      expect(mockUpdate).toHaveBeenCalledTimes(2);
      expect(mockInsert).toHaveBeenCalledTimes(2);
    });
  });

  describe("checkoutWithTradeCredit()", () => {
    test("should throw errors.lockAcquisitionFailed when lock fails", () => {
      const err = new Error("could not obtain lock") as PostgresError;
      err.code = POSTGRES_ERROR_CODES.LOCK_NOT_AVAILABLE;
      mockSelectResolvedValue.mockResolvedValueOnce(Promise.reject(err));

      return expect(
        orderService.checkoutWithTradeCredit("user-1", {} as any, [], "cart-1"),
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
      mockSelectResolvedValue.mockResolvedValueOnce([mockProduct]);

      const items = [{ productId: "prod-1", quantity: 1 } as any];

      return expect(
        orderService.checkoutWithTradeCredit(
          "user-1",
          {} as any,
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
      mockSelectResolvedValue.mockResolvedValueOnce([mockProduct]);
      mockReturning.mockResolvedValueOnce([mockOrder]);

      const items = [{ productId: "prod-1", quantity: 1 } as any];
      const result = await orderService.checkoutWithTradeCredit(
        "user-1",
        {} as any,
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
        creditLimit: "1000.00",
        currentDebt: "500.00",
        name: "Purchaser",
        email: "purch@test.com",
      };
      const mockProduct = { id: "prod-1", price: "200.00" }; // recalculated: 220
      const mockOrder = { id: "order-1", totalAmount: "220.00" };

      mockSelectResolvedValue.mockResolvedValueOnce([mockUser]);
      mockSelectResolvedValue.mockResolvedValueOnce([mockProduct]);
      mockReturning.mockResolvedValueOnce([mockOrder]);

      const items = [{ productId: "prod-1", quantity: 1 } as any];
      const result = await orderService.checkoutWithTradeCredit(
        "user-1",
        {} as any,
        items,
        "cart-1",
      );

      expect(result.id).toBe("order-1");
      expect(mockUpdate).not.toHaveBeenCalled(); // No currentDebt increment for purchaser
      expect(mockInsert).toHaveBeenCalledTimes(3); // Create order, create order items, and insert outbox alert
      expect(mockDelete).toHaveBeenCalledTimes(1); // Clear cart
    });
  });

  describe("approveDealerOrder()", () => {
    test("should return undefined if order does not exist", async () => {
      mockFindFirst.mockResolvedValueOnce(undefined);
      const result = await orderService.approveDealerOrder("order-1");
      expect(result).toBeUndefined();
    });

    test("should return order directly if already APPROVED", async () => {
      const mockOrder = { id: "order-1", approvalStatus: "APPROVED" };
      mockFindFirst.mockResolvedValueOnce(mockOrder);
      const result = await orderService.approveDealerOrder("order-1");
      expect(result).toEqual(mockOrder as any);
    });

    test("should throw errors.insufficientCreditLimit if available credit is insufficient for TRADE_CREDIT order", () => {
      const mockOrder = {
        id: "order-1",
        approvalStatus: "PENDING_APPROVAL",
        paymentMethod: "TRADE_CREDIT",
        totalAmount: "200.00",
        userId: "user-1",
      };
      const mockUser = {
        id: "user-1",
        creditLimit: "100.00",
        currentDebt: "50.00",
      };

      mockFindFirst.mockResolvedValueOnce(mockOrder);
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
        totalAmount: "200.00",
        userId: "user-1",
      };
      const mockUser = {
        id: "user-1",
        creditLimit: "500.00",
        currentDebt: "50.00",
      };
      const approvedOrder = { ...mockOrder, approvalStatus: "APPROVED" };

      mockFindFirst.mockResolvedValueOnce(mockOrder);
      mockSelectResolvedValue.mockResolvedValueOnce([mockUser]);
      mockReturning.mockResolvedValueOnce([approvedOrder]);

      const result = await orderService.approveDealerOrder("order-1");
      expect(result).toEqual(approvedOrder as any);
      expect(mockUpdate).toHaveBeenCalledTimes(2);
    });
  });

  describe("verifyManualBankTransfer()", () => {
    test("should return undefined if order does not exist", async () => {
      mockFindFirst.mockResolvedValueOnce(undefined);
      const result = await orderService.verifyManualBankTransfer(
        "order-1",
        "user-admin",
      );
      expect(result).toBeUndefined();
    });

    test("should update paymentStatus, payments table, and log successful transaction", async () => {
      const mockOrder = {
        id: "order-1",
        totalAmount: "1000.00",
      };
      const updatedOrder = { ...mockOrder, paymentStatus: "FULLY_PAID" };

      mockFindFirst.mockResolvedValueOnce(mockOrder);
      mockReturning.mockResolvedValueOnce([updatedOrder]);

      const result = await orderService.verifyManualBankTransfer(
        "order-1",
        "user-admin",
      );
      expect(result).toEqual(updatedOrder as any);
      expect(mockUpdate).toHaveBeenCalledTimes(2);
      expect(mockInsert).toHaveBeenCalledTimes(1);
    });
  });
});
