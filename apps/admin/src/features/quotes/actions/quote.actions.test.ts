/* eslint-disable @typescript-eslint/unbound-method */
import { expect, test, describe, vi, beforeEach, type Mock } from "bun:test";
import "@/shared/tests/action-mocks";
import {
  approveAndConvertToOrderAction,
  updateQuoteItemPriceAction,
  sendQuoteMessageAction,
  updateQuoteStatusAction,
} from "./quote.actions";
import { quotesService, type ComplexQuote } from "@nhatnang/database/services";
import {
  type TQuote,
  type TQuoteItem,
  type TQuoteMessage,
} from "@nhatnang/database/schemas";
import { revalidatePath } from "next/cache";

describe("quote.actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("approveAndConvertToOrderAction", () => {
    test("should successfully convert quote to order", async () => {
      const mockQuoteId = "00000000-0000-4000-8000-000000000001";
      const mockResult = { orderId: "order-1" };

      (
        quotesService.approveAndConvertToOrder as Mock<
          typeof quotesService.approveAndConvertToOrder
        >
      ).mockResolvedValueOnce(mockResult);

      const res = await approveAndConvertToOrderAction(mockQuoteId);

      expect(res.success).toBe(true);
      expect(res.data).toEqual(mockResult);
      expect(quotesService.approveAndConvertToOrder).toHaveBeenCalledWith(
        mockQuoteId,
        "admin-1",
      );
      expect(revalidatePath).toHaveBeenCalled();
    });

    test("should return error if quoteId is invalid", async () => {
      const res = await approveAndConvertToOrderAction("invalid-uuid");
      expect(res.success).toBe(false);
      expect(res.error).toBe("validationError");
    });
  });

  describe("updateQuoteItemPriceAction", () => {
    test("should successfully update price and transition status to negotiating", async () => {
      const mockQuoteId = "00000000-0000-4000-8000-000000000001";
      const mockItemId = "00000000-0000-4000-8000-000000000002";
      const mockPrice = "120000.00";

      const mockQuote = {
        id: mockQuoteId,
        status: "pending_review",
        items: [
          {
            id: mockItemId,
            product: {
              name: "Product Test",
            },
          },
        ],
      };

      (
        quotesService.getComplexQuote as Mock<
          typeof quotesService.getComplexQuote
        >
      ).mockResolvedValueOnce(mockQuote as unknown as ComplexQuote);
      (
        quotesService.updateQuoteItemPrice as Mock<
          typeof quotesService.updateQuoteItemPrice
        >
      ).mockResolvedValueOnce({} as unknown as TQuoteItem);

      const res = await updateQuoteItemPriceAction(
        mockQuoteId,
        mockItemId,
        mockPrice,
      );

      expect(res.success).toBe(true);
      expect(quotesService.updateQuoteItemPrice).toHaveBeenCalledWith(
        mockItemId,
        mockPrice,
      );
      expect(quotesService.updateQuoteStatus).toHaveBeenCalledWith(
        mockQuoteId,
        "negotiating",
      );
      expect(quotesService.addQuoteMessage).toHaveBeenCalled();
    });

    test("should fail if quote is already approved", async () => {
      const mockQuoteId = "00000000-0000-4000-8000-000000000001";
      const mockItemId = "00000000-0000-4000-8000-000000000002";

      const mockQuote = {
        id: mockQuoteId,
        status: "approved",
        items: [],
      };

      (
        quotesService.getComplexQuote as Mock<
          typeof quotesService.getComplexQuote
        >
      ).mockResolvedValueOnce(mockQuote as unknown as ComplexQuote);

      const res = await updateQuoteItemPriceAction(
        mockQuoteId,
        mockItemId,
        "100.00",
      );

      expect(res.success).toBe(false);
      expect(res.error).toBe("quoteNotEditableOrConvertible");
    });
  });

  describe("sendQuoteMessageAction", () => {
    test("should successfully post message", async () => {
      const mockQuoteId = "00000000-0000-4000-8000-000000000001";
      const mockMessage = "Hello dealer";

      const mockQuote = {
        id: mockQuoteId,
        status: "negotiating",
        items: [],
      };

      (
        quotesService.getComplexQuote as Mock<
          typeof quotesService.getComplexQuote
        >
      ).mockResolvedValueOnce(mockQuote as unknown as ComplexQuote);
      (
        quotesService.addQuoteMessage as Mock<
          typeof quotesService.addQuoteMessage
        >
      ).mockResolvedValueOnce({} as unknown as TQuoteMessage);

      const res = await sendQuoteMessageAction(mockQuoteId, mockMessage);

      expect(res.success).toBe(true);
      expect(quotesService.addQuoteMessage).toHaveBeenCalledWith({
        quoteId: mockQuoteId,
        senderId: "admin-1",
        message: mockMessage,
      });
    });
  });

  describe("updateQuoteStatusAction", () => {
    test("should update status successfully and log timeline message", async () => {
      const mockQuoteId = "00000000-0000-4000-8000-000000000001";

      const mockQuote = {
        id: mockQuoteId,
        status: "negotiating",
        items: [],
      };

      (
        quotesService.getComplexQuote as Mock<
          typeof quotesService.getComplexQuote
        >
      ).mockResolvedValueOnce(mockQuote as unknown as ComplexQuote);
      (
        quotesService.updateQuoteStatus as Mock<
          typeof quotesService.updateQuoteStatus
        >
      ).mockResolvedValueOnce({} as unknown as TQuote);

      const res = await updateQuoteStatusAction(mockQuoteId, "rejected");

      expect(res.success).toBe(true);
      expect(quotesService.updateQuoteStatus).toHaveBeenCalledWith(
        mockQuoteId,
        "rejected",
      );
      expect(quotesService.addQuoteMessage).toHaveBeenCalled();
    });
  });
});
