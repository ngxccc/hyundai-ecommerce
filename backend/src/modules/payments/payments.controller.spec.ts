import { beforeEach, describe, expect, test, mock } from "bun:test";
import { PaymentsController } from "./payments.controller";
import type { PaymentsService } from "./payments.service";
import type {
  CreateCheckoutLinkDto,
  PayOSWebhookDto,
  RepayDebtDto,
  VerifyCashPaymentDto,
} from "./dto";

describe("PaymentsController", () => {
  let controller: PaymentsController;

  const mockCheckoutResult = {
    checkoutUrl: "https://pay.payos.vn/web/1725451234567",
    qrCode: "00020101021238540010A000000727012600069704221725451234567",
    orderCode: 1725451234567,
    amount: 10000000,
    paymentLinkId: "plink_1725451234567",
  };

  const mockWebhookResult = {
    success: true,
    processed: true,
  };

  const mockPaymentSummary = {
    orderId: "order-uuid-1",
    orderNumber: "ORD-20260904-4821",
    totalAmount: "10000000.00",
    depositAmount: "10000000.00",
    remainingAmount: "0.00",
    paymentMethod: "CASH",
    paymentStatus: "FULLY_PAID",
    transactions: [],
  };

  const mockDebtRepaymentResult = {
    id: "debt-uuid-1",
    userId: "user-uuid-1",
    amount: "50000000.00",
    paymentMethod: "PAYOS",
    status: "PENDING",
    orderCode: 1725459999999,
    referenceCode: null,
    verifiedBy: null,
    checkoutUrl: "https://pay.payos.vn/web/1725459999999",
    qrCode: "0002010102...",
    createdAt: new Date("2026-09-04T08:00:00.000Z"),
    updatedAt: new Date("2026-09-04T08:00:00.000Z"),
  };

  const mockPaymentsService = {
    createCheckoutLink: mock((_dto: CreateCheckoutLinkDto) =>
      Promise.resolve(mockCheckoutResult),
    ),
    handlePayOSWebhook: mock((_dto: PayOSWebhookDto) =>
      Promise.resolve(mockWebhookResult),
    ),
    verifyCashPayment: mock(
      (_id: string, _dto: VerifyCashPaymentDto, _adminId: string) =>
        Promise.resolve(mockPaymentSummary),
    ),
    repayDebt: mock((_dto: RepayDebtDto, _currentUserId?: string) =>
      Promise.resolve(mockDebtRepaymentResult),
    ),
    getOrderPaymentSummary: mock((_orderId: string) =>
      Promise.resolve(mockPaymentSummary),
    ),
    clearAll() {
      this.createCheckoutLink.mockClear();
      this.handlePayOSWebhook.mockClear();
      this.verifyCashPayment.mockClear();
      this.repayDebt.mockClear();
      this.getOrderPaymentSummary.mockClear();
    },
  };

  beforeEach(() => {
    mockPaymentsService.clearAll();
    controller = new PaymentsController(
      mockPaymentsService as unknown as PaymentsService,
    );
  });

  describe("POST /payments/checkout-link", () => {
    describe("when customer initiates checkout link creation", () => {
      test("should return wrapped PayOS checkout URL and order code", async () => {
        const dto: CreateCheckoutLinkDto = {
          orderId: "order-uuid-1",
          transactionType: "FULL_PAYMENT",
        };

        const result = await controller.createCheckoutLink(dto);

        expect(mockPaymentsService.createCheckoutLink).toHaveBeenCalledWith(
          dto,
        );
        expect(result.success).toBe(true);
        expect(result.data.orderCode).toBe(1725451234567);
        expect(result.data.amount).toBe(10000000);
      });
    });
  });

  describe("POST /payments/payos-webhook", () => {
    describe("when PayOS webhook event is received", () => {
      test("should return wrapped webhook processing result", async () => {
        const dto: PayOSWebhookDto = {
          code: "00",
          desc: "Success",
          success: true,
          data: {
            orderCode: 1725451234567,
            amount: 10000000,
            description: "ORD-20260904-4821",
          },
          signature: "valid-sig",
        };

        const result = await controller.handleWebhook(dto);

        expect(mockPaymentsService.handlePayOSWebhook).toHaveBeenCalledWith(
          dto,
        );
        expect(result.success).toBe(true);
        expect(result.data.processed).toBe(true);
      });
    });
  });

  describe("POST /payments/:id/verify-cash", () => {
    describe("when accountant confirms cash payment receipt", () => {
      test("should return updated order payment summary", async () => {
        const dto: VerifyCashPaymentDto = {
          amount: 10000000,
          note: "Thu tại văn phòng",
        };

        const result = await controller.verifyCashPayment(
          "order-uuid-1",
          dto,
          "admin-1",
        );

        expect(mockPaymentsService.verifyCashPayment).toHaveBeenCalledWith(
          "order-uuid-1",
          dto,
          "admin-1",
        );
        expect(result.success).toBe(true);
        expect(result.data.paymentStatus).toBe("FULLY_PAID");
      });
    });
  });

  describe("POST /payments/repay-debt", () => {
    describe("when dealer initiates debt repayment", () => {
      test("should return wrapped debt repayment details", async () => {
        const dto: RepayDebtDto = {
          userId: "user-uuid-1",
          amount: 50000000,
          paymentMethod: "PAYOS",
        };

        const result = await controller.repayDebt(dto, "user-uuid-1");

        expect(mockPaymentsService.repayDebt).toHaveBeenCalledWith(
          dto,
          "user-uuid-1",
        );
        expect(result.success).toBe(true);
        expect(result.data.id).toBe("debt-uuid-1");
        expect(result.data.amount).toBe("50000000.00");
      });
    });
  });

  describe("GET /payments/order/:orderId", () => {
    describe("when retrieving order payment details", () => {
      test("should return wrapped order payment summary", async () => {
        const result = await controller.getOrderPaymentSummary("order-uuid-1");

        expect(mockPaymentsService.getOrderPaymentSummary).toHaveBeenCalledWith(
          "order-uuid-1",
        );
        expect(result.success).toBe(true);
        expect(result.data.orderId).toBe("order-uuid-1");
      });
    });
  });
});
