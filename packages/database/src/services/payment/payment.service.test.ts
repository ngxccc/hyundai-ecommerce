import { expect, test, describe, vi, beforeEach } from "bun:test";
import {
  mockDb,
  mockInsert,
  mockUpdate,
  mockReturning,
  mockFindFirst,
  mockSelectResolvedValue,
} from "../../tests/utils/db-mock";
import { DbPaymentService } from "./payment.service";
import type { IDatabase } from "../../client";

const paymentService = new DbPaymentService(mockDb as unknown as IDatabase);

describe("PaymentService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("verifyCashPayment()", () => {
    test("should return undefined if order does not exist", async () => {
      mockFindFirst.mockResolvedValueOnce(undefined);
      const result = await paymentService.verifyCashPayment(
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

      const result = await paymentService.verifyCashPayment(
        "order-1",
        "user-admin",
      );
      expect(result).toEqual(updatedOrder as unknown as { id: string });
      expect(mockUpdate).toHaveBeenCalledTimes(2);
      expect(mockInsert).toHaveBeenCalledTimes(1);
    });
  });

  describe("confirmPayOSPayment()", () => {
    test("should return false if payment does not exist", async () => {
      mockSelectResolvedValue.mockResolvedValueOnce([]); // payment not found

      const result = await paymentService.confirmPayOSPayment(
        "tx-1",
        1000,
        "ref-1",
      );

      expect(result).toBe(false);
    });

    test("should return false if order does not exist", async () => {
      const mockTx = {
        id: "tx-1",
        orderId: "order-1",
        amount: "1000.00",
        status: "PENDING",
      };
      mockSelectResolvedValue.mockResolvedValueOnce([mockTx]); // tx found
      mockSelectResolvedValue.mockResolvedValueOnce([]); // order not found

      const result = await paymentService.confirmPayOSPayment(
        "tx-1",
        1000,
        "ref-1",
      );

      expect(result).toBe(false);
    });

    test("should set status to FAILED and SUSPICIOUS_PAYMENT_HOLD on amount mismatch", async () => {
      const mockTx = {
        id: "tx-1",
        orderId: "order-1",
        amount: "1000.00",
        status: "PENDING",
      };
      const mockOrder = {
        id: "order-1",
        userId: "user-1",
        paymentStatus: "UNPAID",
      };

      mockSelectResolvedValue.mockResolvedValueOnce([mockTx]);
      mockSelectResolvedValue.mockResolvedValueOnce([mockOrder]);

      const result = await paymentService.confirmPayOSPayment(
        "tx-1",
        500, // mismatch
        "ref-1",
      );

      expect(result).toBe(true);
      expect(mockUpdate).toHaveBeenCalledTimes(2); // update tx and update order
      expect(mockInsert).toHaveBeenCalledTimes(1); // outboxEvent
    });

    test("should complete deposit payment successfully", async () => {
      const mockTx = {
        id: "tx-1",
        orderId: "order-1",
        amount: "200.00",
        status: "PENDING",
        transactionType: "DEPOSIT",
      };
      const mockOrder = {
        id: "order-1",
        userId: "user-1",
        paymentStatus: "UNPAID",
      };

      mockSelectResolvedValue.mockResolvedValueOnce([mockTx]);
      mockSelectResolvedValue.mockResolvedValueOnce([mockOrder]);
      mockSelectResolvedValue.mockResolvedValueOnce([
        { email: "customer@test.com" },
      ]);

      const result = await paymentService.confirmPayOSPayment(
        "tx-1",
        200,
        "ref-1",
      );

      expect(result).toBe(true);
      expect(mockUpdate).toHaveBeenCalledTimes(2);
      expect(mockInsert).toHaveBeenCalledTimes(1); // outboxEvents
    });

    test("should complete full payment successfully", async () => {
      const mockTx = {
        id: "tx-1",
        orderId: "order-1",
        amount: "1000.00",
        status: "PENDING",
        transactionType: "FULL",
      };
      const mockOrder = {
        id: "order-1",
        userId: "user-1",
        paymentStatus: "UNPAID",
      };

      mockSelectResolvedValue.mockResolvedValueOnce([mockTx]);
      mockSelectResolvedValue.mockResolvedValueOnce([mockOrder]);
      mockSelectResolvedValue.mockResolvedValueOnce([
        { email: "customer@test.com" },
      ]);

      const result = await paymentService.confirmPayOSPayment(
        "tx-1",
        1000,
        "ref-1",
      );

      expect(result).toBe(true);
      expect(mockUpdate).toHaveBeenCalledTimes(2);
      expect(mockInsert).toHaveBeenCalledTimes(1);
    });
  });
});
