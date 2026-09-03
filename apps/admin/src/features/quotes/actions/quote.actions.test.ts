import { expect, test, describe, beforeEach } from "bun:test";
import {
  mockQuotesApproveAndConvertToOrder,
  mockQuotesGetComplexQuote,
  mockQuotesUpdateQuoteItemPrice,
  mockQuotesAddQuoteMessage,
  mockQuotesSendAdminNegotiationMessage,
  mockQuotesUpdateQuoteStatus,
  mockQuotesCreateAdminQuote,
  mockRevalidatePath,
} from "@nhatnang/shared/testing/action-mocks";
import type { TQuote } from "@nhatnang/database/schemas";

describe("quote.actions", () => {
  beforeEach(() => {
    mockQuotesApproveAndConvertToOrder.mockClear();
    mockQuotesGetComplexQuote.mockClear();
    mockQuotesUpdateQuoteItemPrice.mockClear();
    mockQuotesAddQuoteMessage.mockClear();
    mockQuotesSendAdminNegotiationMessage.mockClear();
    mockQuotesUpdateQuoteStatus.mockClear();
    mockQuotesCreateAdminQuote.mockClear();
    mockRevalidatePath.mockClear();
  });

  describe("approveAndConvertToOrderAction", () => {
    test("should successfully convert quote to order", async () => {
      const { approveAndConvertToOrderAction } = await import("./quote.actions");
      const mockQuoteId = "00000000-0000-4000-8000-000000000001";
      const mockResult = { orderId: "order-1" };

      mockQuotesApproveAndConvertToOrder.mockResolvedValueOnce(mockResult);

      const res = await approveAndConvertToOrderAction(mockQuoteId);

      expect(res.success).toBe(true);
      expect(res.data).toEqual(mockResult);
      expect(mockQuotesApproveAndConvertToOrder).toHaveBeenCalledWith(
        mockQuoteId,
        "admin-1",
      );
      expect(mockRevalidatePath).toHaveBeenCalled();
    });

    test("should return error if quoteId is invalid", async () => {
      const { approveAndConvertToOrderAction } = await import("./quote.actions");
      const res = await approveAndConvertToOrderAction("invalid-uuid");
      expect(res.success).toBe(false);
      expect(res.error).toBe("validationError");
    });
  });

  describe("updateQuoteItemPriceAction", () => {
    test("should successfully update price and transition status to negotiating", async () => {
      const { updateQuoteItemPriceAction } = await import("./quote.actions");
      const mockQuoteId = "00000000-0000-4000-8000-000000000001";
      const mockItemId = "00000000-0000-4000-8000-000000000002";
      const mockPrice = "120000.00";

      const mockQuote = {
        id: mockQuoteId,
        status: "pending_review",
        items: [
          {
            id: mockItemId,
            unitPrice: "100000.00",
            quantity: 2,
            discountPercent: "0",
          },
        ],
      };

      mockQuotesGetComplexQuote.mockResolvedValueOnce(mockQuote);
      mockQuotesUpdateQuoteItemPrice.mockResolvedValueOnce({
        id: mockItemId,
      });
      mockQuotesUpdateQuoteStatus.mockResolvedValueOnce({
        id: mockQuoteId,
        status: "negotiating",
      });
      mockQuotesAddQuoteMessage.mockResolvedValueOnce({});

      const res = await updateQuoteItemPriceAction(
        mockQuoteId,
        mockItemId,
        mockPrice,
      );

      expect(res.success).toBe(true);
      expect(mockQuotesUpdateQuoteItemPrice).toHaveBeenCalledWith(
        mockItemId,
        mockPrice,
      );
      expect(mockQuotesUpdateQuoteStatus).toHaveBeenCalledWith(
        mockQuoteId,
        "negotiating",
      );
      expect(mockQuotesAddQuoteMessage).toHaveBeenCalled();
      expect(mockRevalidatePath).toHaveBeenCalled();
    });

    test("should fail if quote is already approved", async () => {
      const { updateQuoteItemPriceAction } = await import("./quote.actions");
      const mockQuoteId = "00000000-0000-4000-8000-000000000001";
      const mockItemId = "00000000-0000-4000-8000-000000000002";
      const mockPrice = "120000.00";

      const mockQuote = {
        id: mockQuoteId,
        status: "approved",
        items: [{ id: mockItemId }],
      };

      mockQuotesGetComplexQuote.mockResolvedValueOnce(mockQuote);

      const res = await updateQuoteItemPriceAction(
        mockQuoteId,
        mockItemId,
        mockPrice,
      );

      expect(res.success).toBe(false);
      expect(res.error).toBe("quoteNotEditableOrConvertible");
    });
  });

  describe("sendQuoteMessageAction", () => {
    test("should successfully post message via sendAdminNegotiationMessage", async () => {
      const { sendQuoteMessageAction } = await import("./quote.actions");
      const mockQuoteId = "00000000-0000-4000-8000-000000000001";
      const mockMessage = "Hello from admin";

      const mockResult = {
        id: "msg-1",
        quoteId: mockQuoteId,
        message: mockMessage,
      };

      mockQuotesSendAdminNegotiationMessage.mockResolvedValueOnce(mockResult);

      const res = await sendQuoteMessageAction(mockQuoteId, mockMessage);

      expect(res.success).toBe(true);
      expect(mockQuotesSendAdminNegotiationMessage).toHaveBeenCalledWith({
        quoteId: mockQuoteId,
        adminUserId: "admin-1",
        message: mockMessage,
      });
      expect(mockRevalidatePath).toHaveBeenCalled();
    });
  });

  describe("updateQuoteStatusAction", () => {
    test("should update status successfully and log timeline message", async () => {
      const { updateQuoteStatusAction } = await import("./quote.actions");
      const mockQuoteId = "00000000-0000-4000-8000-000000000001";
      const newStatus = "rejected";

      const mockQuote = {
        id: mockQuoteId,
        status: "pending_review",
      };

      mockQuotesGetComplexQuote.mockResolvedValueOnce(mockQuote);
      mockQuotesUpdateQuoteStatus.mockResolvedValueOnce({
        id: mockQuoteId,
        status: newStatus,
      });
      mockQuotesAddQuoteMessage.mockResolvedValueOnce({});

      const res = await updateQuoteStatusAction(mockQuoteId, newStatus);

      expect(res.success).toBe(true);
      expect(mockQuotesUpdateQuoteStatus).toHaveBeenCalledWith(
        mockQuoteId,
        newStatus,
      );
      expect(mockQuotesAddQuoteMessage).toHaveBeenCalled();
      expect(mockRevalidatePath).toHaveBeenCalled();
    });
  });

  describe("createAdminQuoteAction", () => {
    describe("when input payload is valid", () => {
      test("should call quotesService.createAdminQuote and return created quote", async () => {
        const { createAdminQuoteAction } = await import("./quote.actions");
        const validPayload = {
          userId: null,
          customerName: "Nguyễn Văn Test",
          customerPhone: "0901234567",
          customerEmail: "test@example.com",
          companyName: "Công ty Cổ phần Alpha",
          taxId: "0312345678",
          shippingAddress: "123 Đường Số 1, Q.1, TP.HCM",
          vatRate: 10,
          commercialTerms: {
            validityDays: 15,
            paymentSchedule: "Tạm ứng 30%, thanh toán 70%",
            warrantyTerms: "12 tháng chính hãng",
            deliveryTime: "3 ngày làm việc",
            deliveryLocation: "Tại kho bên mua",
          },
          note: "Giao hàng giờ hành chính",
          items: [
            {
              productId: "00000000-0000-4000-8000-000000000001",
              isCustomItem: false,
              itemName: "Máy phát điện Hyundai DHY12500SE",
              itemModel: "DHY12500SE",
              itemSpecs: "10kVA, 1 Pha, Diesel",
              quantity: 1,
              unitPrice: 55000000,
              discountPercent: 0,
            },
          ],
        };

        const mockCreatedQuote: TQuote = {
          id: "00000000-0000-4000-8000-000000000099",
          quoteNumber: "QT-20260902-001",
          userId: null,
          customerName: "Nguyễn Văn Test",
          customerPhone: "0901234567",
          customerEmail: "test@example.com",
          companyName: "Công ty Cổ phần Alpha",
          taxId: "0312345678",
          shippingAddress: "123 Đường Số 1, Q.1, TP.HCM",
          status: "approved",
          subtotalPrice: "55000000.00",
          vatRate: 10,
          vatAmount: "5500000.00",
          totalQuotedPrice: "60500000.00",
          commercialTerms: {
            validityDays: 15,
            paymentSchedule: "Tạm ứng 30%, thanh toán 70%",
            warrantyTerms: "12 tháng chính hãng",
            deliveryTime: "3 ngày làm việc",
            deliveryLocation: "Tại kho bên mua",
          },
          expirationDate: new Date("2026-09-17T00:00:00Z"),
          note: "Giao hàng giờ hành chính",
          orderId: null,
          createdByAdminId: "admin-1",
          createdAt: new Date("2026-09-02T00:00:00Z"),
          updatedAt: new Date("2026-09-02T00:00:00Z"),
        };

        mockQuotesCreateAdminQuote.mockResolvedValueOnce(mockCreatedQuote);

        const res = await createAdminQuoteAction(validPayload);

        expect(res.success).toBe(true);
        if (res.success) {
          expect(res.data.quoteNumber).toBe("QT-20260902-001");
          expect(res.data.totalQuotedPrice).toBe("60500000.00");
        }
        expect(mockQuotesCreateAdminQuote).toHaveBeenCalled();
        expect(mockRevalidatePath).toHaveBeenCalledWith("/quotes");
      });
    });

    describe("when input payload is missing required customer fields", () => {
      test("should return validation error without calling quote service", async () => {
        const { createAdminQuoteAction } = await import("./quote.actions");
        const invalidPayload = {
          customerName: "",
          customerPhone: "invalid",
          items: [],
        };

        const res = await createAdminQuoteAction(invalidPayload);

        expect(res.success).toBe(false);
        if (!res.success) {
          expect(res.error).toBe("validationError");
          expect(res.fieldErrors).toBeDefined();
        }
        expect(mockQuotesCreateAdminQuote).not.toHaveBeenCalled();
      });
    });
  });
});
