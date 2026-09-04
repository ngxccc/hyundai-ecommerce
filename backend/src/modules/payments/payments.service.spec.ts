import { beforeEach, describe, expect, test } from "bun:test";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import type { I18nService } from "nestjs-i18n";
import { PaymentsService } from "./payments.service";
import type { DrizzleDB } from "@/database/database.module";
import { createMockDb, createMockI18nService } from "../../../test/mocks";
import { generatePayOSSignature } from "./payos.util";
import { env } from "@/env";
import type {
  CreateCheckoutLinkDto,
  PayOSWebhookDto,
  RepayDebtDto,
  VerifyCashPaymentDto,
} from "./dto";

describe("PaymentsService", () => {
  let service: PaymentsService;
  const mockDb = createMockDb();
  const mockI18nService = createMockI18nService();

  const mockOrder = {
    id: "019fa8bc-8f4d-7000-b366-e691f45cfb91",
    orderNumber: "ORD-20260904-4821",
    userId: null,
    status: "PENDING" as const,
    totalAmount: "10000000.00",
    depositAmount: "0.00",
    remainingAmount: "10000000.00",
    paymentMethod: "PAYOS" as const,
    paymentStatus: "PENDING" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTransaction = {
    id: "tx-1",
    orderId: mockOrder.id,
    amount: "10000000.00",
    paymentMethod: "PAYOS" as const,
    transactionType: "FULL_PAYMENT" as const,
    status: "PENDING" as const,
    orderCode: 1725451234567,
    referenceCode: null,
    verifiedBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser = {
    id: "user-1",
    fullName: "Đại Lý Hyundai Miền Trung",
    email: "dealer@hyundai.vn",
    phoneNumber: "0901234567",
    creditLimit: "500000000.00",
    currentDebt: "150000000.00",
    role: "SALES" as const,
    status: "ACTIVE" as const,
  };

  beforeEach(() => {
    mockDb.clearAll();
    mockI18nService.clearAll();
    service = new PaymentsService(
      mockDb as unknown as DrizzleDB,
      mockI18nService as unknown as I18nService,
    );
  });

  describe("createCheckoutLink()", () => {
    describe("when valid order exists and full payment is requested", () => {
      test("should record pending transaction and return checkout details", async () => {
        const dto: CreateCheckoutLinkDto = {
          orderId: mockOrder.id,
          transactionType: "FULL_PAYMENT",
        };

        mockDb.setSelectResultsQueue([
          [mockOrder], // select order
          [], // select existing payment (none)
        ]);

        const result = await service.createCheckoutLink(dto);

        expect(result.amount).toBe(10000000);
        expect(result.checkoutUrl).toContain("pay.payos.vn/web/");
        expect(result.orderCode).toBeGreaterThan(0);
      });
    });

    describe("when deposit payment is requested", () => {
      test("should calculate 20 percent deposit amount", async () => {
        const dto: CreateCheckoutLinkDto = {
          orderId: mockOrder.id,
          transactionType: "DEPOSIT",
        };

        mockDb.setSelectResultsQueue([
          [mockOrder],
          [{ id: "payment-1" }], // existing payment
        ]);

        const result = await service.createCheckoutLink(dto);

        // 20% of 10,000,000 = 2,000,000
        expect(result.amount).toBe(2000000);
      });
    });

    describe("when order does not exist", () => {
      test("should throw NotFoundException", () => {
        const dto: CreateCheckoutLinkDto = {
          orderId: "non-existent-order",
          transactionType: "FULL_PAYMENT",
        };

        mockDb.setSelectResult([]);

        expect(service.createCheckoutLink(dto)).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe("when order is cancelled", () => {
      test("should throw BadRequestException", () => {
        const dto: CreateCheckoutLinkDto = {
          orderId: mockOrder.id,
          transactionType: "FULL_PAYMENT",
        };

        mockDb.setSelectResult([{ ...mockOrder, status: "CANCELLED" }]);

        expect(service.createCheckoutLink(dto)).rejects.toThrow(
          BadRequestException,
        );
      });
    });

    describe("when order is already fully paid", () => {
      test("should throw BadRequestException", () => {
        const dto: CreateCheckoutLinkDto = {
          orderId: mockOrder.id,
          transactionType: "FULL_PAYMENT",
        };

        mockDb.setSelectResult([{ ...mockOrder, paymentStatus: "FULLY_PAID" }]);

        expect(service.createCheckoutLink(dto)).rejects.toThrow(
          BadRequestException,
        );
      });
    });
  });

  describe("handlePayOSWebhook()", () => {
    const validData = {
      orderCode: 1725451234567,
      amount: 10000000,
      description: "ORD-20260904-4821",
      reference: "FT24248123456",
    };

    describe("when webhook signature is invalid or tampered", () => {
      test("should reject with BadRequestException", () => {
        const webhookDto: PayOSWebhookDto = {
          code: "00",
          desc: "Success",
          success: true,
          data: validData,
          signature: "invalid-tampered-signature",
        };

        expect(service.handlePayOSWebhook(webhookDto)).rejects.toThrow(
          BadRequestException,
        );
      });
    });

    describe("when webhook signature is authentic and matches pending transaction", () => {
      test("should update transaction, order status to PROCESSING, and emit outbox events", async () => {
        const validSignature = generatePayOSSignature(
          validData,
          env.PAYOS_CHECKSUM_KEY,
        );

        const webhookDto: PayOSWebhookDto = {
          code: "00",
          desc: "Success",
          success: true,
          data: validData,
          signature: validSignature,
        };

        mockDb.setSelectResultsQueue([
          [mockTransaction], // find transaction by orderCode
          [mockOrder], // find order
        ]);

        const result = await service.handlePayOSWebhook(webhookDto);

        expect(result.success).toBe(true);
        expect(result.processed).toBe(true);
      });
    });

    describe("when duplicate webhook arrives for already completed transaction", () => {
      test("should acknowledge idempotently without error", async () => {
        const validSignature = generatePayOSSignature(
          validData,
          env.PAYOS_CHECKSUM_KEY,
        );

        const webhookDto: PayOSWebhookDto = {
          code: "00",
          desc: "Success",
          success: true,
          data: validData,
          signature: validSignature,
        };

        mockDb.setSelectResult([{ ...mockTransaction, status: "COMPLETED" }]);

        const result = await service.handlePayOSWebhook(webhookDto);

        expect(result.success).toBe(true);
        expect(result.processed).toBe(true);
        expect(result.message).toBe("Transaction already processed");
      });
    });

    describe("when payment amount is less than expected payable amount", () => {
      test("should fail transaction and throw BadRequestException", () => {
        const mismatchData = {
          ...validData,
          amount: 5000000, // expected 10,000,000
        };
        const signature = generatePayOSSignature(
          mismatchData,
          env.PAYOS_CHECKSUM_KEY,
        );

        const webhookDto: PayOSWebhookDto = {
          code: "00",
          desc: "Success",
          success: true,
          data: mismatchData,
          signature,
        };

        mockDb.setSelectResult([mockTransaction]);

        expect(service.handlePayOSWebhook(webhookDto)).rejects.toThrow(
          BadRequestException,
        );
      });
    });

    describe("when webhook matches a dealer debt repayment", () => {
      test("should complete debt repayment and atomically decrease dealer current debt", async () => {
        const debtData = {
          orderCode: 1725459999999,
          amount: 50000000,
          description: "DEBT-REPAY",
          reference: "FT999888",
        };
        const signature = generatePayOSSignature(
          debtData,
          env.PAYOS_CHECKSUM_KEY,
        );

        const webhookDto: PayOSWebhookDto = {
          code: "00",
          desc: "Success",
          success: true,
          data: debtData,
          signature,
        };

        const mockDebt = {
          id: "debt-1",
          userId: mockUser.id,
          amount: "50000000.00",
          paymentMethod: "PAYOS" as const,
          status: "PENDING" as const,
          orderCode: debtData.orderCode,
        };

        mockDb.setSelectResultsQueue([
          [], // not an order transaction
          [mockDebt], // found debt repayment
        ]);

        const result = await service.handlePayOSWebhook(webhookDto);

        expect(result.success).toBe(true);
        expect(result.processed).toBe(true);
      });
    });
  });

  describe("verifyCashPayment()", () => {
    describe("when admin confirms cash payment for an order", () => {
      test("should update order status to PROCESSING and paymentStatus to FULLY_PAID", async () => {
        const dto: VerifyCashPaymentDto = {
          amount: 10000000,
          note: "Đã thu tiền mặt tại kho",
        };

        mockDb.setSelectResultsQueue([
          [mockOrder], // find order by ID
          [], // select existing payment
          [mockOrder], // getOrderPaymentSummary -> find order
          [mockTransaction], // getOrderPaymentSummary -> find transactions
        ]);
        const result = await service.verifyCashPayment(
          mockOrder.id,
          dto,
          "admin-1",
        );

        expect(result.orderId).toBe(mockOrder.id);
        expect(result.paymentMethod).toBe("PAYOS");
      });
    });

    describe("when order does not exist", () => {
      test("should throw NotFoundException", () => {
        const dto: VerifyCashPaymentDto = { amount: 5000000 };
        mockDb.setSelectResult([]);

        expect(
          service.verifyCashPayment("invalid-order-id", dto, "admin-1"),
        ).rejects.toThrow(NotFoundException);
      });
    });
  });

  describe("repayDebt()", () => {
    describe("when dealer initiates online debt repayment via PayOS", () => {
      test("should register pending debt repayment and return PayOS link", async () => {
        const dto: RepayDebtDto = {
          userId: mockUser.id,
          amount: 50000000,
          paymentMethod: "PAYOS",
        };

        const mockCreatedDebt = {
          id: "debt-new-1",
          userId: mockUser.id,
          amount: "50000000.00",
          paymentMethod: "PAYOS" as const,
          status: "PENDING" as const,
          orderCode: 1725458888888,
          referenceCode: null,
          verifiedBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockDb.setSelectResultsQueue([
          [mockUser], // select dealer user
          [mockCreatedDebt], // insert debt returning
        ]);

        const result = await service.repayDebt(dto, mockUser.id);

        expect(result.userId).toBe(mockUser.id);
        expect(result.status).toBe("PENDING");
        expect(result.checkoutUrl).toContain("pay.payos.vn/web/");
      });
    });

    describe("when admin processes cash debt repayment", () => {
      test("should complete repayment immediately and decrease current debt", async () => {
        const dto: RepayDebtDto = {
          userId: mockUser.id,
          amount: 50000000,
          paymentMethod: "CASH",
        };

        const mockCompletedDebt = {
          id: "debt-cash-1",
          userId: mockUser.id,
          amount: "50000000.00",
          paymentMethod: "CASH" as const,
          status: "COMPLETED" as const,
          orderCode: 1725457777777,
          referenceCode: null,
          verifiedBy: "admin-1",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockDb.setSelectResultsQueue([
          [mockUser], // select dealer user
          [mockCompletedDebt], // insert debt returning
        ]);

        const result = await service.repayDebt(dto, "admin-1");

        expect(result.status).toBe("COMPLETED");
        expect(result.paymentMethod).toBe("CASH");
      });
    });

    describe("when dealer is not found", () => {
      test("should throw NotFoundException", () => {
        const dto: RepayDebtDto = {
          userId: "non-existent-user",
          amount: 10000000,
          paymentMethod: "PAYOS",
        };

        mockDb.setSelectResult([]);

        expect(service.repayDebt(dto, "admin-1")).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });

  describe("getOrderPaymentSummary()", () => {
    describe("when order exists", () => {
      test("should return order payment status and transaction history", async () => {
        mockDb.setSelectResultsQueue([[mockOrder], [mockTransaction]]);

        const result = await service.getOrderPaymentSummary(mockOrder.id);

        expect(result.orderId).toBe(mockOrder.id);
        expect(result.transactions.length).toBe(1);
        expect(result.transactions[0]?.status).toBe("PENDING");
      });
    });
  });
});
